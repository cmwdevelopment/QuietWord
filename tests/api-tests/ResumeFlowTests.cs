using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QuietWord.Api.Contracts;
using QuietWord.Api.Data;
using QuietWord.Api.Domain;

namespace QuietWord.Api.Tests;

public class ResumeFlowTests(QuietWordWebFactory factory) : IClassFixture<QuietWordWebFactory>
{
    [Fact]
    public async Task StartDay_SaveResume_RestoreFromBootstrap()
    {
        var client = factory.CreateClient();

        var today = await client.GetFromJsonAsync<JsonObject>("/api/day/today");
        Assert.NotNull(today);
        Assert.Equal(1, today!["dayIndex"]!.GetValue<int>());

        var saveResponse = await client.PostAsJsonAsync("/api/state/resume", new
        {
            section = ReadingSection.John,
            @ref = "John 1:1-18",
            chunkIndex = 2,
            verseAnchor = "John 1:3"
        });
        saveResponse.EnsureSuccessStatusCode();

        var bootstrap = await client.GetFromJsonAsync<JsonObject>("/api/bootstrap");
        Assert.NotNull(bootstrap);
        var resume = bootstrap!["resume"]!.AsObject();
        Assert.Equal("john", resume["section"]!.GetValue<string>());
        Assert.Equal("John 1:1-18", resume["lastRef"]!.GetValue<string>());
        Assert.Equal(2, resume["lastChunkIndex"]!.GetValue<int>());
    }
}

public class QuietWordWebFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor is not null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase("quietword-tests");
            });

            using var scope = services.BuildServiceProvider().CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();

            var planId = Guid.NewGuid();
            db.Users.Add(new User { Id = DemoUser.UserId, Name = "Demo User" });
            db.UserSettings.Add(new UserSettings
            {
                UserId = DemoUser.UserId,
                Translation = "WEB",
                Pace = ReadingPace.Standard,
                ReminderTime = new TimeOnly(7, 30)
            });
            db.Plans.Add(new Plan { Id = planId, Slug = "john-psalms-30", Name = "John + Psalms in 30 Days" });
            db.PlanDays.Add(new PlanDay
            {
                Id = Guid.NewGuid(),
                PlanId = planId,
                DayIndex = 1,
                JohnRef = "John 1:1-18",
                PsalmRef = "Psalm 1",
                Theme = "Beginning with the Word"
            });
            db.UserPlans.Add(new UserPlan { UserId = DemoUser.UserId, PlanId = planId, IsActive = true });
            db.ReadingStates.Add(new ReadingState { UserId = DemoUser.UserId, PlanId = planId, CurrentDayIndex = 1 });
            db.SaveChanges();
        });
    }
}
