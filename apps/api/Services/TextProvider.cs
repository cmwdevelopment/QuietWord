using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using QuietWord.Api.Contracts;
using QuietWord.Api.Domain;

namespace QuietWord.Api.Services;

public interface ITextProvider
{
    Task<PassageResponse> GetPassageAsync(string reference, string translation, CancellationToken cancellationToken = default);
}

public sealed class BibleApiTextProvider(
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache,
    IChunkingService chunkingService,
    ILogger<BibleApiTextProvider> logger) : ITextProvider
{
    private static readonly string[] AllowedTranslations = ["WEB", "KJV", "ASV", "BBE", "DARBY"];

    public async Task<PassageResponse> GetPassageAsync(string reference, string translation, CancellationToken cancellationToken = default)
    {
        var normalizedTranslation = AllowedTranslations.Contains(translation.ToUpperInvariant())
            ? translation.ToUpperInvariant()
            : "WEB";
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
}
