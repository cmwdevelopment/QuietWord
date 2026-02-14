namespace QuietWord.Api.Data;

public sealed class PlanSeedFile
{
    public string Slug { get; set; } = "john-psalms-30";
    public string Name { get; set; } = "John + Psalms in 30 Days";
    public List<PlanSeedDay> Days { get; set; } = new();
}

public sealed class PlanSeedDay
{
    public int DayIndex { get; set; }
    public string JohnRef { get; set; } = string.Empty;
    public string PsalmRef { get; set; } = string.Empty;
    public string Theme { get; set; } = string.Empty;
    public Dictionary<string, string>? Recaps { get; set; }
}
