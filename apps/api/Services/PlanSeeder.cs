using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using QuietWord.Api.Contracts;
using QuietWord.Api.Data;
using QuietWord.Api.Domain;

namespace QuietWord.Api.Services;

public sealed class PlanSeeder(ILogger<PlanSeeder> logger, IWebHostEnvironment env)
{
    public async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        var candidates = new[]
        {
            Path.Combine(env.ContentRootPath, "seed", "john-psalms-30.json"),
            Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "..", "seed", "john-psalms-30.json"))
        };
        var path = candidates.FirstOrDefault(File.Exists) ?? candidates[0];
        if (!File.Exists(path))
        {
            logger.LogWarning("Seed file missing at {Path}", path);
            return;
        }

        var payload = await File.ReadAllTextAsync(path, cancellationToken);
        var seed = JsonSerializer.Deserialize<PlanSeedFile>(payload, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (seed is null || seed.Days.Count == 0)
        {
            logger.LogWarning("Seed file was empty or invalid.");
            return;
        }

        var plan = await db.Plans.Include(x => x.Days).SingleOrDefaultAsync(x => x.Slug == seed.Slug, cancellationToken);
        if (plan is null)
        {
            plan = new Plan
            {
                Id = Guid.NewGuid(),
                Slug = seed.Slug,
                Name = seed.Name
            };
            db.Plans.Add(plan);
        }
        else
        {
            plan.Name = seed.Name;
        }

        db.PlanDays.RemoveRange(db.PlanDays.Where(x => x.PlanId == plan.Id));

        foreach (var day in seed.Days.OrderBy(x => x.DayIndex))
        {
            db.PlanDays.Add(new PlanDay
            {
                Id = Guid.NewGuid(),
                PlanId = plan.Id,
                DayIndex = day.DayIndex,
                JohnRef = day.JohnRef,
                PsalmRef = day.PsalmRef,
                Theme = day.Theme,
                RecapsJson = System.Text.Json.JsonSerializer.Serialize(day.Recaps ?? BuildFallbackRecaps(day.Theme))
            });
        }

        var user = await db.Users.SingleOrDefaultAsync(x => x.Id == DemoUser.UserId, cancellationToken);
        if (user is null)
        {
            user = new User { Id = DemoUser.UserId, Name = "Demo User" };
            db.Users.Add(user);
        }

        var settings = await db.UserSettings.FindAsync([DemoUser.UserId], cancellationToken);
        if (settings is null)
        {
            db.UserSettings.Add(new UserSettings
            {
                UserId = DemoUser.UserId,
                Translation = "WEB",
                Pace = ReadingPace.Standard,
                ReminderTime = new TimeOnly(7, 30),
                FontFamily = "Roboto",
                RecapVoice = "classic_pastor",
                AccentColor = "teal_calm"
            });
        }

        var userPlan = await db.UserPlans.FindAsync([DemoUser.UserId, plan.Id], cancellationToken);
        if (userPlan is null)
        {
            db.UserPlans.Add(new UserPlan
            {
                UserId = DemoUser.UserId,
                PlanId = plan.Id,
                IsActive = true
            });
        }
        else
        {
            userPlan.IsActive = true;
        }

        var state = await db.ReadingStates.FindAsync([DemoUser.UserId, plan.Id], cancellationToken);
        if (state is null)
        {
            db.ReadingStates.Add(new ReadingState
            {
                UserId = DemoUser.UserId,
                PlanId = plan.Id,
                CurrentDayIndex = 1,
                Section = ReadingSection.None,
                LastRef = string.Empty,
                LastChunkIndex = 0
            });
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static Dictionary<string, string> BuildFallbackRecaps(string theme)
    {
        return new Dictionary<string, string>
        {
            ["classic_pastor"] = $"Today invites you to rest in {theme.ToLowerInvariant()} and walk with steady faith.",
            ["gen_z"] = $"Real talk: {theme} is your reminder that God is still moving, even in your chaos.",
            ["poetic"] = $"In the hush of this day, {theme.ToLowerInvariant()} becomes a lamp for your next step.",
            ["coach"] = $"Keep it simple today: center your heart on {theme.ToLowerInvariant()} and practice one obedient step.",
            ["scholar"] = $"Taken together, these passages frame {theme.ToLowerInvariant()} as both theological truth and daily practice."
        };
    }
}
