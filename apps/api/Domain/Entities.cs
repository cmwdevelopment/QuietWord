using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace QuietWord.Api.Domain;

public sealed class User
{
    public Guid Id { get; set; }
    [MaxLength(120)] public string Name { get; set; } = "Demo User";
    [MaxLength(200)] public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserSettings? Settings { get; set; }
}

public sealed class UserSettings
{
    [Key] public Guid UserId { get; set; }
    [MaxLength(10)] public string Translation { get; set; } = "WEB";
    public ReadingPace Pace { get; set; } = ReadingPace.Standard;
    public TimeOnly ReminderTime { get; set; } = new(7, 30);
    [MaxLength(80)] public string FontFamily { get; set; } = "Roboto";
    [MaxLength(40)] public string RecapVoice { get; set; } = "classic_pastor";
    [MaxLength(40)] public string AccentColor { get; set; } = "teal_calm";
    public bool ListeningEnabled { get; set; }
    [MaxLength(40)] public string ListeningVoice { get; set; } = "warm_guide";
    [MaxLength(40)] public string ListeningStyle { get; set; } = "calm_presence";
    public decimal ListeningSpeed { get; set; } = 1.0m;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public sealed class Plan
{
    public Guid Id { get; set; }
    [MaxLength(80)] public string Slug { get; set; } = string.Empty;
    [MaxLength(160)] public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PlanDay> Days { get; set; } = new List<PlanDay>();
}

public sealed class PlanDay
{
    public Guid Id { get; set; }
    public Guid PlanId { get; set; }
    public int DayIndex { get; set; }
    [MaxLength(80)] public string JohnRef { get; set; } = string.Empty;
    [MaxLength(80)] public string PsalmRef { get; set; } = string.Empty;
    [MaxLength(160)] public string Theme { get; set; } = string.Empty;
    [Column(TypeName = "jsonb")] public string RecapsJson { get; set; } = "{}";

    public Plan? Plan { get; set; }

    [NotMapped]
    public Dictionary<string, string> Recaps
    {
        get => JsonSerializer.Deserialize<Dictionary<string, string>>(RecapsJson) ?? new Dictionary<string, string>();
        set => RecapsJson = JsonSerializer.Serialize(value ?? new Dictionary<string, string>());
    }
}

public sealed class UserPlan
{
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public Plan? Plan { get; set; }
}

public sealed class ReadingState
{
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }
    public int CurrentDayIndex { get; set; } = 1;
    public ReadingSection Section { get; set; } = ReadingSection.None;
    [MaxLength(80)] public string LastRef { get; set; } = string.Empty;
    public int LastChunkIndex { get; set; }
    [MaxLength(40)] public string? VerseAnchor { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public Plan? Plan { get; set; }
}

public sealed class DailyCompletion
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }
    public int DayIndex { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}

public sealed class ThreadNote
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }
    public NoteType NoteType { get; set; }
    [MaxLength(80)] public string Ref { get; set; } = string.Empty;
    [MaxLength(2000)] public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class RecallItem
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }
    public int DayIndex { get; set; }
    [Column(TypeName = "jsonb")] public string ChoicesJson { get; set; } = "[]";
    public int CorrectChoiceIndex { get; set; }
    public int? SelectedChoiceIndex { get; set; }
    public DateTime? AnsweredAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public string[] Choices
    {
        get => JsonSerializer.Deserialize<string[]>(ChoicesJson) ?? Array.Empty<string>();
        set => ChoicesJson = JsonSerializer.Serialize(value ?? Array.Empty<string>());
    }
}

public sealed class MagicLinkToken
{
    public Guid Id { get; set; }
    [MaxLength(200)] public string Email { get; set; } = string.Empty;
    [MaxLength(128)] public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Session
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    [MaxLength(128)] public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class FeedbackItem
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    [MaxLength(40)] public string Category { get; set; } = "general";
    public int Rating { get; set; } = 5;
    [MaxLength(2000)] public string Message { get; set; } = string.Empty;
    [MaxLength(120)] public string? ContextPath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class VerseHighlight
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    [MaxLength(10)] public string Translation { get; set; } = "WEB";
    [MaxLength(80)] public string VerseRef { get; set; } = string.Empty;
    [MaxLength(24)] public string Color { get; set; } = "amber";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
