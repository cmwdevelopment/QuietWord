using Microsoft.EntityFrameworkCore;
using QuietWord.Api.Domain;

namespace QuietWord.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<PlanDay> PlanDays => Set<PlanDay>();
    public DbSet<UserPlan> UserPlans => Set<UserPlan>();
    public DbSet<ReadingState> ReadingStates => Set<ReadingState>();
    public DbSet<DailyCompletion> DailyCompletions => Set<DailyCompletion>();
    public DbSet<ThreadNote> ThreadNotes => Set<ThreadNote>();
    public DbSet<RecallItem> RecallItems => Set<RecallItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(b =>
        {
            b.ToTable("users");
            b.HasKey(x => x.Id);
        });

        modelBuilder.Entity<UserSettings>(b =>
        {
            b.ToTable("user_settings");
            b.HasKey(x => x.UserId);
            b.HasOne(x => x.User).WithOne(x => x.Settings).HasForeignKey<UserSettings>(x => x.UserId);
            b.Property(x => x.Translation).HasColumnName("translation");
            b.Property(x => x.Pace).HasConversion<string>().HasColumnName("pace");
            b.Property(x => x.ReminderTime).HasColumnName("reminder_time");
            b.Property(x => x.FontFamily).HasColumnName("font_family");
            b.Property(x => x.RecapVoice).HasColumnName("recap_voice");
            b.Property(x => x.AccentColor).HasColumnName("accent_color");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        modelBuilder.Entity<Plan>(b =>
        {
            b.ToTable("plans");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.Slug).IsUnique();
            b.Property(x => x.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<PlanDay>(b =>
        {
            b.ToTable("plan_days");
            b.HasKey(x => x.Id);
            b.HasOne(x => x.Plan).WithMany(x => x.Days).HasForeignKey(x => x.PlanId).OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(x => new { x.PlanId, x.DayIndex }).IsUnique();
            b.Property(x => x.PlanId).HasColumnName("plan_id");
            b.Property(x => x.DayIndex).HasColumnName("day_index");
            b.Property(x => x.JohnRef).HasColumnName("john_ref");
            b.Property(x => x.PsalmRef).HasColumnName("psalm_ref");
            b.Property(x => x.RecapsJson).HasColumnName("recaps").HasColumnType("jsonb");
        });

        modelBuilder.Entity<UserPlan>(b =>
        {
            b.ToTable("user_plans");
            b.HasKey(x => new { x.UserId, x.PlanId });
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.PlanId).HasColumnName("plan_id");
            b.Property(x => x.IsActive).HasColumnName("is_active");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            b.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
            b.HasOne(x => x.Plan).WithMany().HasForeignKey(x => x.PlanId);
        });

        modelBuilder.Entity<ReadingState>(b =>
        {
            b.ToTable("reading_state");
            b.HasKey(x => new { x.UserId, x.PlanId });
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.PlanId).HasColumnName("plan_id");
            b.Property(x => x.CurrentDayIndex).HasColumnName("current_day_index");
            b.Property(x => x.Section).HasConversion<string>().HasColumnName("section");
            b.Property(x => x.LastRef).HasColumnName("last_ref");
            b.Property(x => x.LastChunkIndex).HasColumnName("last_chunk_index");
            b.Property(x => x.VerseAnchor).HasColumnName("verse_anchor");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            b.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
            b.HasOne(x => x.Plan).WithMany().HasForeignKey(x => x.PlanId);
        });

        modelBuilder.Entity<DailyCompletion>(b =>
        {
            b.ToTable("daily_completions");
            b.HasKey(x => x.Id);
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.PlanId).HasColumnName("plan_id");
            b.Property(x => x.DayIndex).HasColumnName("day_index");
            b.Property(x => x.CompletedAt).HasColumnName("completed_at");
            b.HasIndex(x => new { x.UserId, x.PlanId, x.DayIndex }).IsUnique();
            b.HasIndex(x => new { x.UserId, x.PlanId, x.CompletedAt }).IsDescending(false, false, true);
        });

        modelBuilder.Entity<ThreadNote>(b =>
        {
            b.ToTable("thread_notes");
            b.HasKey(x => x.Id);
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.PlanId).HasColumnName("plan_id");
            b.Property(x => x.NoteType).HasConversion<string>().HasColumnName("note_type");
            b.Property(x => x.Ref).HasColumnName("ref");
            b.Property(x => x.Body).HasColumnName("body");
            b.Property(x => x.CreatedAt).HasColumnName("created_at");
            b.HasIndex(x => new { x.UserId, x.CreatedAt }).IsDescending(false, true);
        });

        modelBuilder.Entity<RecallItem>(b =>
        {
            b.ToTable("recall_items");
            b.HasKey(x => x.Id);
            b.Property(x => x.UserId).HasColumnName("user_id");
            b.Property(x => x.PlanId).HasColumnName("plan_id");
            b.Property(x => x.DayIndex).HasColumnName("day_index");
            b.Property(x => x.ChoicesJson).HasColumnName("choices").HasColumnType("jsonb");
            b.Property(x => x.CorrectChoiceIndex).HasColumnName("correct_choice_index");
            b.Property(x => x.SelectedChoiceIndex).HasColumnName("selected_choice_index");
            b.Property(x => x.AnsweredAt).HasColumnName("answered_at");
            b.Property(x => x.CreatedAt).HasColumnName("created_at");
            b.HasIndex(x => x.UserId).HasFilter("answered_at IS NULL");
        });
    }
}
