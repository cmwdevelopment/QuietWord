using Microsoft.EntityFrameworkCore;
using QuietWord.Api.Data;
using QuietWord.Api.Domain;

namespace QuietWord.Api.Services;

public sealed class UserBootstrapper(AppDbContext db)
{
    public async Task EnsureUserInitializedAsync(Guid userId, CancellationToken ct = default)
    {
        var plan = await db.Plans.OrderBy(x => x.CreatedAt).FirstOrDefaultAsync(ct);
        if (plan is null) return;

        var settings = await db.UserSettings.FindAsync([userId], ct);
        if (settings is null)
        {
            db.UserSettings.Add(new UserSettings
            {
                UserId = userId,
                Translation = "WEB",
                Pace = ReadingPace.Standard,
                ReminderTime = new TimeOnly(7, 30),
                FontFamily = "Roboto",
                RecapVoice = "classic_pastor",
                AccentColor = "teal_calm",
                ListeningEnabled = false,
                ListeningVoice = "warm_guide",
                ListeningStyle = "calm_presence",
                ListeningSpeed = 1.0m,
                UpdatedAt = DateTime.UtcNow
            });
        }

        var userPlan = await db.UserPlans.FindAsync([userId, plan.Id], ct);
        if (userPlan is null)
        {
            db.UserPlans.Add(new UserPlan
            {
                UserId = userId,
                PlanId = plan.Id,
                IsActive = true,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            userPlan.IsActive = true;
            userPlan.UpdatedAt = DateTime.UtcNow;
        }

        var state = await db.ReadingStates.FindAsync([userId, plan.Id], ct);
        if (state is null)
        {
            db.ReadingStates.Add(new ReadingState
            {
                UserId = userId,
                PlanId = plan.Id,
                CurrentDayIndex = 1,
                Section = ReadingSection.None,
                LastRef = string.Empty,
                LastChunkIndex = 0,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync(ct);
    }
}
