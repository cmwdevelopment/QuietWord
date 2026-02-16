using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Microsoft.Extensions.Caching.Memory;
using QuietWord.Api.Contracts;
using QuietWord.Api.Domain;

namespace QuietWord.Api.Services;

public interface ITextProvider
{
    IReadOnlyList<string> GetSupportedTranslations();
    Task<PassageResponse> GetPassageAsync(string reference, string translation, CancellationToken cancellationToken = default);
}

public sealed class BibleApiTextProvider(
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache,
    IChunkingService chunkingService,
    ILogger<BibleApiTextProvider> logger) : ITextProvider
{
    private static readonly string[] ApiTranslations = ["WEB", "KJV", "ASV", "BBE", "DARBY"];
    private static readonly IReadOnlyDictionary<string, (int BookNumber, string DisplayName)> BookMap = BuildBookMap();
    private static readonly Regex RefRegex = new(
        @"^(?<book>[1-3]?\s*[A-Za-z]+)\s+(?<chapter>\d+)(?::(?<start>\d+)(?:-(?<end>\d+))?)?$",
        RegexOptions.Compiled);

    private readonly IReadOnlyDictionary<string, string> _xmlTranslations =
        DiscoverXmlTranslations(Path.Combine(AppContext.BaseDirectory, "seed", "xml"));

    public IReadOnlyList<string> GetSupportedTranslations()
    {
        return _xmlTranslations.Keys
            .Concat(ApiTranslations)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(x => x, StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    public async Task<PassageResponse> GetPassageAsync(string reference, string translation, CancellationToken cancellationToken = default)
    {
        var normalizedTranslation = (translation ?? string.Empty).Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(normalizedTranslation))
        {
            normalizedTranslation = "WEB";
        }

        if (_xmlTranslations.TryGetValue(normalizedTranslation, out var xmlPath))
        {
            var xmlResult = TryGetFromXml(reference, normalizedTranslation, xmlPath);
            if (xmlResult is not null)
            {
                return xmlResult;
            }
        }

        if (!ApiTranslations.Contains(normalizedTranslation, StringComparer.OrdinalIgnoreCase))
        {
            normalizedTranslation = "WEB";
        }

        var cacheKey = $"passage:{reference}:{normalizedTranslation}";

        if (cache.TryGetValue(cacheKey, out PassageResponse? cached) && cached is not null)
        {
            return cached;
        }

        try
        {
            var client = httpClientFactory.CreateClient("bible-api");
            var uriRef = Uri.EscapeDataString(reference);
            var translationParam = normalizedTranslation.ToLowerInvariant();
            using var response = await client.GetAsync($"/{uriRef}?translation={translationParam}", cancellationToken);
            response.EnsureSuccessStatusCode();

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            var root = document.RootElement;
            var parsedRef = root.TryGetProperty("reference", out var refProp) ? refProp.GetString() ?? reference : reference;
            var verses = new List<VerseDto>();

            if (root.TryGetProperty("verses", out var versesArray))
            {
                foreach (var verse in versesArray.EnumerateArray())
                {
                    var book = verse.GetProperty("book_name").GetString() ?? string.Empty;
                    var chapter = verse.GetProperty("chapter").GetInt32();
                    var verseNum = verse.GetProperty("verse").GetInt32();
                    var text = (verse.GetProperty("text").GetString() ?? string.Empty).Trim();
                    verses.Add(new VerseDto($"{book} {chapter}:{verseNum}", text, chapter, verseNum));
                }
            }

            if (verses.Count == 0)
            {
                return BuildFallback(reference, normalizedTranslation);
            }

            var section = reference.StartsWith("Psalm", StringComparison.OrdinalIgnoreCase)
                ? ReadingSection.Psalm
                : ReadingSection.John;
            var chunks = chunkingService.Chunk(section, verses);
            var result = new PassageResponse(parsedRef, normalizedTranslation, verses.ToArray(), chunks.ToArray());
            cache.Set(cacheKey, result, TimeSpan.FromMinutes(30));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch passage {Reference} in {Translation}", reference, normalizedTranslation);
            return BuildFallback(reference, normalizedTranslation);
        }
    }

    private PassageResponse BuildFallback(string reference, string translation)
    {
        var verses = new[] { new VerseDto(reference, "Scripture is temporarily unavailable. Please try again shortly.", 0, 0) };
        var chunks = chunkingService.Chunk(reference.StartsWith("Psalm", StringComparison.OrdinalIgnoreCase) ? ReadingSection.Psalm : ReadingSection.John, verses).ToArray();
        return new PassageResponse(reference, translation, verses, chunks);
    }

    private PassageResponse? TryGetFromXml(string reference, string translation, string xmlPath)
    {
        var parsed = ParseReference(reference);
        if (parsed is null) return null;

        var cacheKey = $"xmlpassage:{xmlPath}:{parsed.BookNumber}:{parsed.Chapter}:{parsed.StartVerse}:{parsed.EndVerse}";
        if (cache.TryGetValue(cacheKey, out PassageResponse? cached) && cached is not null)
        {
            return cached;
        }

        var chapterVerses = LoadChapterFromXml(xmlPath, parsed.BookNumber, parsed.Chapter);
        if (chapterVerses.Count == 0)
        {
            logger.LogWarning("No verses found in XML for {Reference} ({Translation})", reference, translation);
            return null;
        }

        var selected = chapterVerses
            .Where(x => x.Key >= parsed.StartVerse && x.Key <= parsed.EndVerse)
            .OrderBy(x => x.Key)
            .ToArray();

        if (selected.Length == 0)
        {
            return null;
        }

        var verses = selected
            .Select(x => new VerseDto($"{parsed.BookDisplayName} {parsed.Chapter}:{x.Key}", x.Value, parsed.Chapter, x.Key))
            .ToArray();

        var section = parsed.BookNumber == 19 ? ReadingSection.Psalm : ReadingSection.John;
        var chunks = chunkingService.Chunk(section, verses).ToArray();
        var result = new PassageResponse(reference, translation, verses, chunks);
        cache.Set(cacheKey, result, TimeSpan.FromMinutes(30));
        return result;
    }

    private static IReadOnlyDictionary<string, string> DiscoverXmlTranslations(string folder)
    {
        if (!Directory.Exists(folder))
        {
            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        }

        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var file in Directory.EnumerateFiles(folder, "*.xml", SearchOption.TopDirectoryOnly))
        {
            var code = InferTranslationCode(Path.GetFileNameWithoutExtension(file));
            if (!string.IsNullOrWhiteSpace(code))
            {
                map[code] = file;
            }
        }

        return map;
    }

    private static string InferTranslationCode(string fileNameWithoutExtension)
    {
        var normalized = fileNameWithoutExtension.Trim().ToUpperInvariant();
        if (normalized.Contains("INTERNATIONAL VERSION") || normalized.Contains(" NIV")) return "NIV";
        if (normalized.Contains("AMP")) return "AMP";
        if (normalized.Contains("ESV")) return "ESV";
        if (normalized.Contains("MSG")) return "MSG";
        if (normalized.Contains("NASB")) return "NASB";
        if (normalized.Contains("NIRV")) return "NIRV";
        if (normalized.Contains("NKJV")) return "NKJV";
        if (normalized.Contains("NLT")) return "NLT";

        var alpha = new string(normalized.Where(char.IsLetter).ToArray());
        if (alpha.Length == 0) return string.Empty;
        return alpha.Length <= 6 ? alpha : alpha[..6];
    }

    private static ParsedReference? ParseReference(string reference)
    {
        var match = RefRegex.Match(reference.Trim());
        if (!match.Success) return null;

        var rawBook = match.Groups["book"].Value.Trim();
        var chapter = int.Parse(match.Groups["chapter"].Value);
        var hasStart = match.Groups["start"].Success;
        var startVerse = hasStart ? int.Parse(match.Groups["start"].Value) : 1;
        var endVerse = match.Groups["end"].Success
            ? int.Parse(match.Groups["end"].Value)
            : hasStart ? startVerse : int.MaxValue;

        var normalizedBook = NormalizeBookKey(rawBook);
        if (!BookMap.TryGetValue(normalizedBook, out var mapping))
        {
            return null;
        }

        return new ParsedReference(mapping.BookNumber, mapping.DisplayName, chapter, startVerse, Math.Max(startVerse, endVerse));
    }

    private SortedDictionary<int, string> LoadChapterFromXml(string xmlPath, int bookNumber, int chapterNumber)
    {
        var cacheKey = $"xmlchapter:{xmlPath}:{bookNumber}:{chapterNumber}";
        if (cache.TryGetValue(cacheKey, out SortedDictionary<int, string>? cached) && cached is not null)
        {
            return cached;
        }

        var targetBookNumber = bookNumber.ToString();
        var verses = new SortedDictionary<int, string>();

        try
        {
            var doc = XDocument.Load(xmlPath, LoadOptions.PreserveWhitespace);
            var book = doc.Descendants("BIBLEBOOK")
                .FirstOrDefault(x =>
                {
                    var bnumber = (string?)x.Attribute("bnumber") ?? string.Empty;
                    return string.Equals(bnumber, targetBookNumber, StringComparison.OrdinalIgnoreCase);
                });
            if (book is null)
            {
                return verses;
            }

            var chapter = book.Elements("CHAPTER")
                .FirstOrDefault(x => (string?)x.Attribute("cnumber") == chapterNumber.ToString());
            if (chapter is null)
            {
                return verses;
            }

            foreach (var verse in chapter.Elements("VERS"))
            {
                if (!int.TryParse((string?)verse.Attribute("vnumber"), out var num)) continue;
                var text = (verse.Value ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(text)) continue;
                verses[num] = text;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to load XML translation file {File}", xmlPath);
        }

        cache.Set(cacheKey, verses, TimeSpan.FromHours(2));
        return verses;
    }

    private static string NormalizeBookKey(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        var lowered = raw.Trim().ToLowerInvariant().Replace(".", string.Empty);
        lowered = Regex.Replace(lowered, @"\s+", " ");
        return lowered switch
        {
            "psalms" => "psalm",
            "song of songs" => "song of solomon",
            _ => lowered
        };
    }

    private static IReadOnlyDictionary<string, (int BookNumber, string DisplayName)> BuildBookMap()
    {
        var books = new[]
        {
            "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel",
            "1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalm","Proverbs",
            "Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
            "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke",
            "John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians",
            "1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter",
            "2 Peter","1 John","2 John","3 John","Jude","Revelation"
        };

        var map = new Dictionary<string, (int, string)>(StringComparer.OrdinalIgnoreCase);
        for (var i = 0; i < books.Length; i++)
        {
            var display = books[i];
            map[NormalizeBookKey(display)] = (i + 1, display);
        }
        map["psalms"] = map["psalm"];
        map["song of songs"] = map["song of solomon"];
        return map;
    }

    private sealed record ParsedReference(int BookNumber, string BookDisplayName, int Chapter, int StartVerse, int EndVerse);
}
