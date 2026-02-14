using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using QuietWord.Api.Contracts;
using QuietWord.Api.Data;
using QuietWord.Api.Domain;

namespace QuietWord.Api.Services;

public interface IAuthService
{
    Task<AuthMeResponse?> SignInAsync(string email, HttpResponse response, CancellationToken ct = default);
    Task<RequestMagicLinkResponse> RequestMagicLinkAsync(string email, CancellationToken ct = default);
    Task<AuthMeResponse?> VerifyMagicLinkAsync(string email, string token, HttpResponse response, CancellationToken ct = default);
    Task<AuthMeResponse?> GetCurrentUserAsync(HttpRequest request, CancellationToken ct = default);
    Task<Guid?> GetCurrentUserIdAsync(HttpRequest request, CancellationToken ct = default);
    Task LogoutAsync(HttpRequest request, HttpResponse response, CancellationToken ct = default);
}

public sealed class AuthService(AppDbContext db, IWebHostEnvironment env, UserBootstrapper userBootstrapper) : IAuthService
{
    private const string SessionCookie = "qw_session";
    private static readonly TimeSpan SessionLifetime = TimeSpan.FromDays(30);

    public async Task<AuthMeResponse?> SignInAsync(string email, HttpResponse response, CancellationToken ct = default)
    {
        var normalizedEmail = NormalizeEmail(email);
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            return null;
        }

        var user = await GetOrCreateUserAsync(normalizedEmail, ct);
        await CreateSessionAsync(user.Id, response, ct);
        await userBootstrapper.EnsureUserInitializedAsync(user.Id, ct);
        return new AuthMeResponse(user.Id, user.Email);
    }

    public async Task<RequestMagicLinkResponse> RequestMagicLinkAsync(string email, CancellationToken ct = default)
    {
        var normalizedEmail = NormalizeEmail(email);
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            return new RequestMagicLinkResponse(false);
        }

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
        var tokenHash = Hash(token);

        db.MagicLinkTokens.Add(new MagicLinkToken
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(20),
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);

        return env.IsDevelopment()
            ? new RequestMagicLinkResponse(true, token)
            : new RequestMagicLinkResponse(true);
    }

    public async Task<AuthMeResponse?> VerifyMagicLinkAsync(string email, string token, HttpResponse response, CancellationToken ct = default)
    {
        var normalizedEmail = NormalizeEmail(email);
        var normalizedToken = (token ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(normalizedToken))
        {
            return null;
        }

        var tokenHash = Hash(normalizedToken);

        var record = await db.MagicLinkTokens
            .Where(x => x.Email == normalizedEmail && x.TokenHash == tokenHash && x.UsedAt == null && x.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (record is null) return null;

        record.UsedAt = DateTime.UtcNow;

        var user = await GetOrCreateUserAsync(normalizedEmail, ct);
        await CreateSessionAsync(user.Id, response, ct);
        await userBootstrapper.EnsureUserInitializedAsync(user.Id, ct);
        return new AuthMeResponse(user.Id, user.Email);
    }

    public async Task<AuthMeResponse?> GetCurrentUserAsync(HttpRequest request, CancellationToken ct = default)
    {
        var userId = await GetCurrentUserIdAsync(request, ct);
        if (userId is null) return null;

        var user = await db.Users.SingleOrDefaultAsync(x => x.Id == userId.Value, ct);
        return user is null ? null : new AuthMeResponse(user.Id, user.Email);
    }

    public async Task<Guid?> GetCurrentUserIdAsync(HttpRequest request, CancellationToken ct = default)
    {
        if (!request.Cookies.TryGetValue(SessionCookie, out var sessionToken) || string.IsNullOrWhiteSpace(sessionToken))
        {
            return null;
        }

        var hash = Hash(sessionToken);
        var session = await db.Sessions.SingleOrDefaultAsync(x => x.TokenHash == hash && x.ExpiresAt > DateTime.UtcNow, ct);
        return session?.UserId;
    }

    public async Task LogoutAsync(HttpRequest request, HttpResponse response, CancellationToken ct = default)
    {
        if (request.Cookies.TryGetValue(SessionCookie, out var sessionToken) && !string.IsNullOrWhiteSpace(sessionToken))
        {
            var hash = Hash(sessionToken);
            var session = await db.Sessions.SingleOrDefaultAsync(x => x.TokenHash == hash, ct);
            if (session is not null)
            {
                db.Sessions.Remove(session);
                await db.SaveChangesAsync(ct);
            }
        }

        response.Cookies.Delete(SessionCookie, new CookieOptions { Path = "/" });
    }

    private static string Hash(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }

    private static string NormalizeEmail(string email) => (email ?? string.Empty).Trim().ToLowerInvariant();

    private async Task<User> GetOrCreateUserAsync(string normalizedEmail, CancellationToken ct)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == normalizedEmail, ct);
        if (user is not null)
        {
            return user;
        }

        user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            Name = normalizedEmail.Split('@')[0],
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return user;
    }

    private async Task CreateSessionAsync(Guid userId, HttpResponse response, CancellationToken ct)
    {
        var sessionToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var sessionHash = Hash(sessionToken);
        db.Sessions.Add(new Session
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = sessionHash,
            ExpiresAt = DateTime.UtcNow.Add(SessionLifetime),
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync(ct);

        response.Cookies.Append(SessionCookie, sessionToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !env.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.Add(SessionLifetime),
            Path = "/"
        });
    }
}
