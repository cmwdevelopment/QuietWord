using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace QuietWord.Api.Services;

public interface IAudioSynthesisService
{
    Task<byte[]> SynthesizeAsync(string text, string voiceId, decimal speed, CancellationToken ct = default);
}

public sealed class OpenAiAudioSynthesisService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<OpenAiAudioSynthesisService> logger) : IAudioSynthesisService
{
    private const int MaxInputLength = 6000;

    public async Task<byte[]> SynthesizeAsync(string text, string voiceId, decimal speed, CancellationToken ct = default)
    {
        var apiKey = configuration["OPENAI_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("OPENAI_API_KEY is not configured.");
        }

        var clippedText = ClipText(text);
        var model = configuration["OPENAI_TTS_MODEL"] ?? "gpt-4o-mini-tts";
        var voice = ResolveOpenAiVoice(voiceId);
        var normalizedSpeed = Math.Clamp(speed, 0.75m, 1.50m);

        var payload = new
        {
            model,
            voice,
            input = clippedText,
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

        return await response.Content.ReadAsByteArrayAsync(ct);
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
            "youthful" => "aria",
            "classic" => "ash",
            _ => "alloy"
        };
    }
}
