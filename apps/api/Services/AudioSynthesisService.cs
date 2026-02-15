using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace QuietWord.Api.Services;

public interface IAudioSynthesisService
{
    Task<byte[]> SynthesizeAsync(string text, string voiceId, string styleId, decimal speed, CancellationToken ct = default);
}

public sealed class OpenAiAudioSynthesisService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    IMemoryCache cache,
    ILogger<OpenAiAudioSynthesisService> logger) : IAudioSynthesisService
{
    private const int MaxInputLength = 6000;

    public async Task<byte[]> SynthesizeAsync(string text, string voiceId, string styleId, decimal speed, CancellationToken ct = default)
    {
        var apiKey = configuration["OPENAI_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("OPENAI_API_KEY is not configured.");
        }

        var clippedText = ClipText(text);
        var model = configuration["OPENAI_TTS_MODEL"] ?? "gpt-4o-mini-tts";
        var voice = ResolveOpenAiVoice(voiceId);
        var style = ResolveStyleInstruction(styleId);
        var normalizedSpeed = Math.Clamp(speed, 0.75m, 1.50m);
        var promptedText = $"{style} {clippedText}".Trim();
        var cacheKey = BuildCacheKey(model, voice, styleId, normalizedSpeed, promptedText);

        if (cache.TryGetValue(cacheKey, out byte[]? cachedAudio) && cachedAudio is not null)
        {
            return cachedAudio;
        }

        var payload = new
        {
            model,
            voice,
            input = promptedText,
            format = "mp3",
            speed = normalizedSpeed
        };

        var client = httpClientFactory.CreateClient("openai-tts");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/v1/audio/speech");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var response = await client.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("OpenAI TTS request failed ({StatusCode}): {Body}", (int)response.StatusCode, body);
            throw new InvalidOperationException("Failed to synthesize audio.");
        }

        var audio = await response.Content.ReadAsByteArrayAsync(ct);
        cache.Set(cacheKey, audio, TimeSpan.FromHours(24));
        return audio;
    }

    private static string ClipText(string text)
    {
        var value = (text ?? string.Empty).Trim();
        if (value.Length <= MaxInputLength) return value;
        return value[..MaxInputLength];
    }

    private static string ResolveOpenAiVoice(string voiceId)
    {
        return voiceId switch
        {
            "warm_guide" => "alloy",
            "calm_narrator" => "verse",
            "pastoral" => "sage",
            "youthful" => "nova",
            "classic" => "ash",
            _ => "alloy"
        };
    }

    private static string ResolveStyleInstruction(string styleId)
    {
        return styleId switch
        {
            "revival_fire" => "Read with energetic sermon rhythm, bold emphasis, dramatic pauses, and warm conviction.",
            "resonant_orator" => "Read in a deep, resonant, deliberate cadence with confident sentence endings.",
            "calm_presence" => "Read softly and calmly with gentle pacing, relaxed pauses, and reassuring warmth.",
            "conversational_shepherd" => "Read warmly and personally, like a trusted guide speaking one-to-one.",
            "reflective_reading" => "Read slowly and contemplatively with light emphasis and spacious pauses.",
            _ => "Read naturally, clearly, and warmly."
        };
    }

    private static string BuildCacheKey(string model, string voice, string styleId, decimal speed, string text)
    {
        var payload = $"{model}|{voice}|{styleId}|{speed:F2}|{text}";
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
        return $"tts:{Convert.ToHexString(hash)}";
    }
}
