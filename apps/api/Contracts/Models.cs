using QuietWord.Api.Domain;

namespace QuietWord.Api.Contracts;

public static class DemoUser
{
    public static readonly Guid UserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
}

public sealed record VerseDto(string Ref, string Text, int Chapter, int Verse);
public sealed record PassageChunkDto(int ChunkIndex, string[] VerseRefs, string Text);
public sealed record PassageResponse(string Ref, string Translation, VerseDto[] Verses, PassageChunkDto[] Chunks);

public sealed record BootstrapResponse(
    PlanSummary Plan,
    UserSettingsDto Settings,
    TodaySummary Today,
    ResumeSummary? Resume,
    RecallPendingSummary? PendingRecall,
    string[] SupportedTranslations,
    string[] SupportedRecapVoices,
    string[] SupportedAccentColors,
    string TranslationMicrocopy);

public sealed record PlanSummary(Guid PlanId, string Slug, string Name, int TotalDays, int CurrentDayIndex);
public sealed record UserSettingsDto(string Translation, string Pace, string ReminderTime, string FontFamily, string RecapVoice, string AccentColor);
public sealed record TodaySummary(int DayIndex, string JohnRef, string PsalmRef, string Theme, string DailyRecap, bool CompletedToday, int Streak, int GraceStreak);
public sealed record ResumeSummary(string Section, string LastRef, int LastChunkIndex, string? VerseAnchor, DateTime UpdatedAt);
public sealed record RecallPendingSummary(Guid RecallId, int DayIndex, string[] Choices);

public sealed record DayTodayResponse(int DayIndex, string JohnRef, string PsalmRef, string Theme);
public sealed record SaveResumeRequest(ReadingSection Section, string Ref, int ChunkIndex, string? VerseAnchor);
public sealed record CreateNoteRequest(NoteType NoteType, string Ref, string Body);
public sealed record NoteDto(Guid Id, string NoteType, string Ref, string Body, DateTime CreatedAt);
public sealed record CompleteDayResponse(int PreviousDayIndex, int NewCurrentDayIndex, bool CreatedRecall);
public sealed record RecallPendingResponse(Guid RecallId, int DayIndex, string[] Choices);
public sealed record RecallAnswerRequest(Guid RecallId, int SelectedChoiceIndex);
public sealed record SaveSettingsRequest(string Translation, string Pace, string ReminderTime, string? FontFamily = null, string? RecapVoice = null, string? AccentColor = null);
