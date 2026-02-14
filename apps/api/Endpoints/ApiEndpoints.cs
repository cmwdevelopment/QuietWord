using Microsoft.EntityFrameworkCore;
using QuietWord.Api.Contracts;
using QuietWord.Api.Data;
using QuietWord.Api.Domain;
using QuietWord.Api.Services;

namespace QuietWord.Api.Endpoints;

public static class ApiEndpoints
{
    private static readonly string[] SupportedRecapVoices = ["classic_pastor", "gen_z", "poetic", "coach", "scholar"];
    private static readonly string[] SupportedAccentColors = ["teal_calm", "sage_mist", "sky_blue", "lavender_hush", "rose_dawn", "sand_warm"];
    private static readonly string[] SupportedListeningVoices = ["warm_guide", "calm_narrator", "pastoral", "youthful", "classic"];
    private static readonly HashSet<string> SupportedFonts = new(StringComparer.OrdinalIgnoreCase)
    {
        "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Merriweather", "Lora", "PT Serif", "Playfair Display"
    };

    public static RouteGroupBuilder MapQuietWordApi(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api");

        group.MapPost("/auth/login", LoginAsync);
        group.MapPost("/auth/request-link", RequestMagicLinkAsync);
        group.MapPost("/auth/verify-link", VerifyMagicLinkAsync);
        group.MapGet("/auth/me", GetMeAsync);
        group.MapPost("/auth/logout", LogoutAsync);

        group.MapGet("/bootstrap", GetBootstrapAsync);
        group.MapGet("/day/today", GetTodayAsync);
        group.MapGet("/passage", GetPassageAsync);
        group.MapPost("/state/resume", SaveResumeAsync);
        group.MapPost("/notes", CreateNoteAsync);
        group.MapGet("/notes", GetNotesAsync);
        group.MapPost("/day/complete", CompleteDayAsync);
        group.MapGet("/recall/pending", GetPendingRecallAsync);
        group.MapPost("/recall/answer", AnswerRecallAsync);
        group.MapGet("/settings", GetSettingsAsync);
        group.MapPost("/settings", SaveSettingsAsync);
        group.MapPost("/audio/synthesize", SynthesizeAudioAsync);

        return group;
    }

    private static async Task<IResult> LoginAsync(SimpleLoginRequest request, IAuthService authService, HttpResponse response, CancellationToken ct)
    {
        var me = await authService.SignInAsync(request.Email, response, ct);
        return me is null ? Results.BadRequest("Email is required.") : Results.Ok(me);
    }

    private static async Task<IResult> RequestMagicLinkAsync(RequestMagicLinkRequest request, IAuthService authService, CancellationToken ct)
    {
        var result = await authService.RequestMagicLinkAsync(request.Email, ct);
        return Results.Ok(result);
    }

    private static async Task<IResult> VerifyMagicLinkAsync(VerifyMagicLinkRequest request, IAuthService authService, HttpResponse response, CancellationToken ct)
    {
        var me = await authService.VerifyMagicLinkAsync(request.Email, request.Token, response, ct);
        return me is null ? Results.Unauthorized() : Results.Ok(me);
    }

    private static async Task<IResult> GetMeAsync(IAuthService authService, HttpRequest request, CancellationToken ct)
    {
        var me = await authService.GetCurrentUserAsync(request, ct);
        return me is null ? Results.Unauthorized() : Results.Ok(me);
    }

    private static async Task<IResult> LogoutAsync(IAuthService authService, HttpRequest request, HttpResponse response, CancellationToken ct)
    {
        await authService.LogoutAsync(request, response, ct);
        return Results.Ok(new { loggedOut = true });
    }

    private static async Task<IResult> GetBootstrapAsync(AppDbContext db, IAuthService authService, ITextProvider textProvider, HttpRequest request, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(request, ct);
        if (userId is null) return Results.Unauthorized();

        var planData = await GetActivePlanAndStateAsync(db, userId.Value, ct);
        if (planData is null) return Results.NotFound("No active plan was found.");

        var (plan, state) = planData.Value;
        var today = await db.PlanDays.SingleAsync(x => x.PlanId == plan.Id && x.DayIndex == state.CurrentDayIndex, ct);
        var settings = await db.UserSettings.FindAsync([userId.Value], ct) ?? new UserSettings { UserId = userId.Value };
        var recapVoice = SupportedRecapVoices.Contains(settings.RecapVoice) ? settings.RecapVoice : "classic_pastor";
        var accentColor = SupportedAccentColors.Contains(settings.AccentColor) ? settings.AccentColor : "teal_calm";
        var dailyRecap = ResolveRecap(today, recapVoice);

        var recentCompletion = await db.DailyCompletions
            .Where(x => x.UserId == userId.Value && x.PlanId == plan.Id)
            .OrderByDescending(x => x.DayIndex)
            .Take(7)
            .ToListAsync(ct);

        var streak = 0;
        var cursor = state.CurrentDayIndex - 1;
        while (cursor > 0 && recentCompletion.Any(x => x.DayIndex == cursor))
        {
            streak++;
            cursor--;
        }

        var windowStart = Math.Max(1, state.CurrentDayIndex - 7);
        var expectedDays = Enumerable.Range(windowStart, Math.Max(0, state.CurrentDayIndex - windowStart)).ToArray();
        var completedInWindow = recentCompletion.Where(x => expectedDays.Contains(x.DayIndex)).Select(x => x.DayIndex).Distinct().Count();
        var graceStreak = Math.Max(0, expectedDays.Length - completedInWindow);

        RecallPendingSummary? pendingRecall = null;
        var pending = await db.RecallItems
            .Where(x => x.UserId == userId.Value && x.AnsweredAt == null)
            .OrderBy(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);
        if (pending is not null)
        {
            pendingRecall = new RecallPendingSummary(pending.Id, pending.DayIndex, pending.Choices);
        }

        ResumeSummary? resume = null;
        if (state.Section != ReadingSection.None && !string.IsNullOrWhiteSpace(state.LastRef))
        {
            resume = new ResumeSummary(state.Section.ToString().ToLowerInvariant(), state.LastRef, state.LastChunkIndex, state.VerseAnchor, state.UpdatedAt);
        }

        var response = new BootstrapResponse(
            new PlanSummary(plan.Id, plan.Slug, plan.Name, await db.PlanDays.CountAsync(x => x.PlanId == plan.Id, ct), state.CurrentDayIndex),
            new UserSettingsDto(
                settings.Translation,
                settings.Pace.ToString().ToLowerInvariant(),
                settings.ReminderTime.ToString("HH:mm"),
                settings.FontFamily,
                recapVoice,
                accentColor,
                settings.ListeningEnabled,
                SupportedListeningVoices.Contains(settings.ListeningVoice) ? settings.ListeningVoice : "warm_guide",
                NormalizeListeningSpeed(settings.ListeningSpeed)),
            new TodaySummary(
                today.DayIndex,
                today.JohnRef,
                today.PsalmRef,
                today.Theme,
                dailyRecap,
                await db.DailyCompletions.AnyAsync(x => x.UserId == userId.Value && x.PlanId == plan.Id && x.DayIndex == state.CurrentDayIndex, ct),
                streak,
                graceStreak),
            resume,
            pendingRecall,
            textProvider.GetSupportedTranslations().ToArray(),
            SupportedRecapVoices,
            SupportedAccentColors,
            SupportedListeningVoices,
            "Translation availability depends on your installed text libraries.");

        return Results.Ok(response);
    }

    private static async Task<IResult> GetTodayAsync(AppDbContext db, IAuthService authService, HttpRequest request, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(request, ct);
        if (userId is null) return Results.Unauthorized();

        var planData = await GetActivePlanAndStateAsync(db, userId.Value, ct);
        if (planData is null) return Results.NotFound("No active plan was found.");

        var (plan, state) = planData.Value;
        var day = await db.PlanDays.SingleOrDefaultAsync(x => x.PlanId == plan.Id && x.DayIndex == state.CurrentDayIndex, ct);
        if (day is null) return Results.NotFound("No day is available for current index.");

        return Results.Ok(new DayTodayResponse(day.DayIndex, day.JohnRef, day.PsalmRef, day.Theme));
    }

    private static async Task<IResult> GetPassageAsync(string @ref, string? translation, ITextProvider textProvider, IAuthService authService, HttpRequest request, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(request, ct);
        if (userId is null) return Results.Unauthorized();

        if (string.IsNullOrWhiteSpace(@ref)) return Results.BadRequest("Missing ref query parameter.");
        var value = await textProvider.GetPassageAsync(@ref.Trim(), string.IsNullOrWhiteSpace(translation) ? "WEB" : translation, ct);
        return Results.Ok(value);
    }

    private static async Task<IResult> SaveResumeAsync(SaveResumeRequest request, AppDbContext db, IAuthService authService, HttpRequest httpRequest, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(httpRequest, ct);
        if (userId is null) return Results.Unauthorized();

        var planData = await GetActivePlanAndStateAsync(db, userId.Value, ct);
        if (planData is null) return Results.NotFound("No active plan was found.");

        var (_, state) = planData.Value;
        state.Section = request.Section;
        state.LastRef = request.Ref.Trim();
        state.LastChunkIndex = Math.Max(request.ChunkIndex, 0);
        state.VerseAnchor = request.VerseAnchor;
        state.UpdatedAt = DateTime.UtcNow;

        db.ReadingStates.Update(state);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new { saved = true });
    }

    private static async Task<IResult> CreateNoteAsync(CreateNoteRequest request, AppDbContext db, IAuthService authService, HttpRequest httpRequest, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(httpRequest, ct);
        if (userId is null) return Results.Unauthorized();

        var plan = await GetActivePlanAsync(db, userId.Value, ct);
        if (plan is null) return Results.NotFound("No active plan was found.");

        var note = new ThreadNote
        {
            Id = Guid.NewGuid(),
            UserId = userId.Value,
            PlanId = plan.Id,
            NoteType = request.NoteType,
            Ref = request.Ref.Trim(),
            Body = request.Body.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        db.ThreadNotes.Add(note);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new NoteDto(note.Id, note.NoteType.ToString(), note.Ref, note.Body, note.CreatedAt));
    }

    private static async Task<IResult> GetNotesAsync(int? limit, AppDbContext db, IAuthService authService, HttpRequest httpRequest, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(httpRequest, ct);
        if (userId is null) return Results.Unauthorized();

        var size = Math.Clamp(limit ?? 10, 1, 50);
        var notes = await db.ThreadNotes
            .Where(x => x.UserId == userId.Value)
            .OrderByDescending(x => x.CreatedAt)
            .Take(size)
            .Select(x => new NoteDto(x.Id, x.NoteType.ToString(), x.Ref, x.Body, x.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(notes);
    }

    private static async Task<IResult> CompleteDayAsync(AppDbContext db, IAuthService authService, HttpRequest httpRequest, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(httpRequest, ct);
        if (userId is null) return Results.Unauthorized();

        var planData = await GetActivePlanAndStateAsync(db, userId.Value, ct);
        if (planData is null) return Results.NotFound("No active plan was found.");

        var (plan, state) = planData.Value;
        var currentDay = state.CurrentDayIndex;

        var completionExists = await db.DailyCompletions
            .AnyAsync(x => x.UserId == userId.Value && x.PlanId == plan.Id && x.DayIndex == currentDay, ct);

        if (!completionExists)
        {
            db.DailyCompletions.Add(new DailyCompletion
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                PlanId = plan.Id,
                DayIndex = currentDay,
                CompletedAt = DateTime.UtcNow
            });
        }

        var createdRecall = false;
        var existingRecall = await db.RecallItems.AnyAsync(x => x.UserId == userId.Value && x.PlanId == plan.Id && x.DayIndex == currentDay, ct);
        if (!existingRecall)
        {
            var day = await db.PlanDays.SingleOrDefaultAsync(x => x.PlanId == plan.Id && x.DayIndex == currentDay, ct);
            if (day is not null)
            {
                db.RecallItems.Add(new RecallItem
                {
                    Id = Guid.NewGuid(),
                    UserId = userId.Value,
                    PlanId = plan.Id,
                    DayIndex = currentDay,
                    CorrectChoiceIndex = 0,
                    Choices =
                    [
                        $"God met you in {day.Theme.ToLowerInvariant()}.",
                        "Today was mainly about spiritual busyness.",
                        "The center was practical planning, not prayer."
                    ],
                    CreatedAt = DateTime.UtcNow
                });
                createdRecall = true;
            }
        }

        state.Section = ReadingSection.None;
        state.LastRef = string.Empty;
        state.LastChunkIndex = 0;
        state.VerseAnchor = null;
        state.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return Results.Ok(new CompleteDayResponse(currentDay, state.CurrentDayIndex, createdRecall));
    }

    private static async Task<IResult> GetPendingRecallAsync(AppDbContext db, IAuthService authService, HttpRequest request, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(request, ct);
        if (userId is null) return Results.Unauthorized();

        var pending = await db.RecallItems
            .Where(x => x.UserId == userId.Value && x.AnsweredAt == null)
            .OrderBy(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);

        return pending is null
            ? Results.NoContent()
            : Results.Ok(new RecallPendingResponse(pending.Id, pending.DayIndex, pending.Choices));
    }

    private static async Task<IResult> AnswerRecallAsync(RecallAnswerRequest request, AppDbContext db, IAuthService authService, HttpRequest httpRequest, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(httpRequest, ct);
        if (userId is null) return Results.Unauthorized();

        var recall = await db.RecallItems.SingleOrDefaultAsync(x => x.Id == request.RecallId && x.UserId == userId.Value, ct);
        if (recall is null) return Results.NotFound("Recall item not found.");

        recall.SelectedChoiceIndex = request.SelectedChoiceIndex;
        recall.AnsweredAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return Results.Ok(new { saved = true, correct = request.SelectedChoiceIndex == recall.CorrectChoiceIndex });
    }

    private static async Task<IResult> GetSettingsAsync(AppDbContext db, IAuthService authService, HttpRequest request, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(request, ct);
        if (userId is null) return Results.Unauthorized();

        var settings = await db.UserSettings.FindAsync([userId.Value], ct) ?? new UserSettings
        {
            UserId = userId.Value,
            Translation = "WEB",
            Pace = ReadingPace.Standard,
            ReminderTime = new TimeOnly(7, 30),
            FontFamily = "Roboto",
            RecapVoice = "classic_pastor",
            AccentColor = "teal_calm",
            ListeningEnabled = false,
            ListeningVoice = "warm_guide",
            ListeningSpeed = 1.0m
        };

        return Results.Ok(new UserSettingsDto(
            settings.Translation,
            settings.Pace.ToString().ToLowerInvariant(),
            settings.ReminderTime.ToString("HH:mm"),
            settings.FontFamily,
            settings.RecapVoice,
            settings.AccentColor,
            settings.ListeningEnabled,
            SupportedListeningVoices.Contains(settings.ListeningVoice) ? settings.ListeningVoice : "warm_guide",
            NormalizeListeningSpeed(settings.ListeningSpeed)));
    }

    private static async Task<IResult> SaveSettingsAsync(SaveSettingsRequest request, AppDbContext db, IAuthService authService, ITextProvider textProvider, HttpRequest httpRequest, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(httpRequest, ct);
        if (userId is null) return Results.Unauthorized();

        var supportedTranslations = textProvider.GetSupportedTranslations();
        var settings = await db.UserSettings.FindAsync([userId.Value], ct);

        var normalizedTranslation = supportedTranslations.Contains(request.Translation.ToUpperInvariant())
            ? request.Translation.ToUpperInvariant()
            : "WEB";
        var pace = request.Pace.Equals("short", StringComparison.OrdinalIgnoreCase) ? ReadingPace.Short : ReadingPace.Standard;
        if (!TimeOnly.TryParse(request.ReminderTime, out var reminderTime)) reminderTime = new TimeOnly(7, 30);
        var fontFamily = string.IsNullOrWhiteSpace(request.FontFamily) || !SupportedFonts.Contains(request.FontFamily.Trim())
            ? settings?.FontFamily ?? "Roboto"
            : request.FontFamily.Trim();
        var recapVoice = string.IsNullOrWhiteSpace(request.RecapVoice) || !SupportedRecapVoices.Contains(request.RecapVoice.Trim())
            ? settings?.RecapVoice ?? "classic_pastor"
            : request.RecapVoice.Trim();
        var accentColor = string.IsNullOrWhiteSpace(request.AccentColor) || !SupportedAccentColors.Contains(request.AccentColor.Trim())
            ? settings?.AccentColor ?? "teal_calm"
            : request.AccentColor.Trim();
        var listeningVoice = string.IsNullOrWhiteSpace(request.ListeningVoice) || !SupportedListeningVoices.Contains(request.ListeningVoice.Trim())
            ? settings?.ListeningVoice ?? "warm_guide"
            : request.ListeningVoice.Trim();
        var listeningEnabled = request.ListeningEnabled ?? settings?.ListeningEnabled ?? false;
        var listeningSpeed = NormalizeListeningSpeed(request.ListeningSpeed ?? settings?.ListeningSpeed ?? 1.0m);
        if (settings is null)
        {
            settings = new UserSettings
            {
                UserId = userId.Value,
                Translation = normalizedTranslation,
                Pace = pace,
                ReminderTime = reminderTime,
                FontFamily = fontFamily,
                RecapVoice = recapVoice,
                AccentColor = accentColor,
                ListeningEnabled = listeningEnabled,
                ListeningVoice = listeningVoice,
                ListeningSpeed = listeningSpeed,
                UpdatedAt = DateTime.UtcNow
            };
            db.UserSettings.Add(settings);
        }
        else
        {
            settings.Translation = normalizedTranslation;
            settings.Pace = pace;
            settings.ReminderTime = reminderTime;
            settings.FontFamily = fontFamily;
            settings.RecapVoice = recapVoice;
            settings.AccentColor = accentColor;
            settings.ListeningEnabled = listeningEnabled;
            settings.ListeningVoice = listeningVoice;
            settings.ListeningSpeed = listeningSpeed;
            settings.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(new UserSettingsDto(
            settings.Translation,
            settings.Pace.ToString().ToLowerInvariant(),
            settings.ReminderTime.ToString("HH:mm"),
            settings.FontFamily,
            settings.RecapVoice,
            settings.AccentColor,
            settings.ListeningEnabled,
            settings.ListeningVoice,
            NormalizeListeningSpeed(settings.ListeningSpeed)));
    }

    private static async Task<IResult> SynthesizeAudioAsync(AudioSynthesizeRequest request, IAudioSynthesisService audioService, IAuthService authService, HttpRequest httpRequest, CancellationToken ct)
    {
        var userId = await authService.GetCurrentUserIdAsync(httpRequest, ct);
        if (userId is null) return Results.Unauthorized();

        var text = (request.Text ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(text))
        {
            return Results.BadRequest("Text is required.");
        }

        var voice = string.IsNullOrWhiteSpace(request.Voice) ? "warm_guide" : request.Voice.Trim();
        if (!SupportedListeningVoices.Contains(voice))
        {
            voice = "warm_guide";
        }

        var speed = NormalizeListeningSpeed(request.Speed ?? 1.0m);

        try
        {
            var audio = await audioService.SynthesizeAsync(text, voice, speed, ct);
            return Results.File(audio, "audio/mpeg", enableRangeProcessing: false);
        }
        catch (Exception)
        {
            return Results.Problem("Unable to synthesize audio right now.", statusCode: StatusCodes.Status502BadGateway);
        }
    }

    private static async Task<Plan?> GetActivePlanAsync(AppDbContext db, Guid userId, CancellationToken ct)
    {
        var planId = await db.UserPlans
            .Where(x => x.UserId == userId && x.IsActive)
            .Select(x => x.PlanId)
            .FirstOrDefaultAsync(ct);

        if (planId == Guid.Empty) return null;
        return await db.Plans.SingleAsync(x => x.Id == planId, ct);
    }

    private static async Task<(Plan plan, ReadingState state)?> GetActivePlanAndStateAsync(AppDbContext db, Guid userId, CancellationToken ct)
    {
        var plan = await GetActivePlanAsync(db, userId, ct);
        if (plan is null) return null;

        var state = await db.ReadingStates.FindAsync([userId, plan.Id], ct);
        if (state is null)
        {
            state = new ReadingState
            {
                UserId = userId,
                PlanId = plan.Id,
                CurrentDayIndex = 1,
                Section = ReadingSection.None,
                LastRef = string.Empty,
                LastChunkIndex = 0,
                UpdatedAt = DateTime.UtcNow
            };
            db.ReadingStates.Add(state);
            await db.SaveChangesAsync(ct);
        }

        await AdvanceDayIfNeededAsync(db, userId, plan, state, ct);
        return (plan, state);
    }

    private static async Task AdvanceDayIfNeededAsync(AppDbContext db, Guid userId, Plan plan, ReadingState state, CancellationToken ct)
    {
        var completionForCurrentDay = await db.DailyCompletions
            .Where(x => x.UserId == userId && x.PlanId == plan.Id && x.DayIndex == state.CurrentDayIndex)
            .OrderByDescending(x => x.CompletedAt)
            .FirstOrDefaultAsync(ct);

        if (completionForCurrentDay is null) return;
        if (completionForCurrentDay.CompletedAt.Date >= DateTime.UtcNow.Date) return;

        var maxDay = await db.PlanDays.Where(x => x.PlanId == plan.Id).MaxAsync(x => x.DayIndex, ct);
        state.CurrentDayIndex = Math.Min(maxDay, state.CurrentDayIndex + 1);
        state.Section = ReadingSection.None;
        state.LastRef = string.Empty;
        state.LastChunkIndex = 0;
        state.VerseAnchor = null;
        state.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
    }

    private static string ResolveRecap(PlanDay day, string voice)
    {
        var recaps = day.Recaps;
        if (recaps.TryGetValue(voice, out var selected) && !string.IsNullOrWhiteSpace(selected))
        {
            return selected;
        }

        if (recaps.TryGetValue("classic_pastor", out var fallback) && !string.IsNullOrWhiteSpace(fallback))
        {
            return fallback;
        }

        return $"Today, {day.Theme.ToLowerInvariant()} invites you to keep walking with Jesus one faithful step at a time.";
    }

    private static decimal NormalizeListeningSpeed(decimal value)
    {
        return Math.Round(Math.Clamp(value, 0.75m, 1.50m), 2);
    }
}
