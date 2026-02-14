using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using QuietWord.Api.Data;

#nullable disable

namespace QuietWord.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("202602130001_InitialCreate")]
public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "plans",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Slug = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                Name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_plans", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_users", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "plan_days",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                day_index = table.Column<int>(type: "integer", nullable: false),
                john_ref = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                psalm_ref = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                Theme = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_plan_days", x => x.Id);
                table.ForeignKey(
                    name: "FK_plan_days_plans_plan_id",
                    column: x => x.plan_id,
                    principalTable: "plans",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "user_plans",
            columns: table => new
            {
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                is_active = table.Column<bool>(type: "boolean", nullable: false),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_user_plans", x => new { x.user_id, x.plan_id });
                table.ForeignKey(
                    name: "FK_user_plans_plans_plan_id",
                    column: x => x.plan_id,
                    principalTable: "plans",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_user_plans_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "user_settings",
            columns: table => new
            {
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                translation = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                pace = table.Column<string>(type: "text", nullable: false),
                reminder_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_user_settings", x => x.UserId);
                table.ForeignKey(
                    name: "FK_user_settings_users_UserId",
                    column: x => x.UserId,
                    principalTable: "users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "daily_completions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                day_index = table.Column<int>(type: "integer", nullable: false),
                completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_daily_completions", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "reading_state",
            columns: table => new
            {
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                current_day_index = table.Column<int>(type: "integer", nullable: false),
                section = table.Column<string>(type: "text", nullable: false),
                last_ref = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                last_chunk_index = table.Column<int>(type: "integer", nullable: false),
                verse_anchor = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_reading_state", x => new { x.user_id, x.plan_id });
                table.ForeignKey(
                    name: "FK_reading_state_plans_plan_id",
                    column: x => x.plan_id,
                    principalTable: "plans",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_reading_state_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "recall_items",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                day_index = table.Column<int>(type: "integer", nullable: false),
                choices = table.Column<string>(type: "jsonb", nullable: false),
                correct_choice_index = table.Column<int>(type: "integer", nullable: false),
                selected_choice_index = table.Column<int>(type: "integer", nullable: true),
                answered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_recall_items", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "thread_notes",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                note_type = table.Column<string>(type: "text", nullable: false),
                @ref = table.Column<string>(name: "ref", type: "character varying(80)", maxLength: 80, nullable: false),
                body = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_thread_notes", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_daily_completions_user_id_plan_id_day_index",
            table: "daily_completions",
            columns: new[] { "user_id", "plan_id", "day_index" },
            unique: true);

        migrationBuilder.Sql(
            "CREATE INDEX \"IX_daily_completions_user_id_plan_id_completed_at_desc\" ON daily_completions (user_id, plan_id, completed_at DESC);");

        migrationBuilder.CreateIndex(
            name: "IX_plan_days_plan_id_day_index",
            table: "plan_days",
            columns: new[] { "plan_id", "day_index" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_plans_Slug",
            table: "plans",
            column: "Slug",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_recall_items_user_id",
            table: "recall_items",
            column: "user_id",
            filter: "answered_at IS NULL");

        migrationBuilder.CreateIndex(
            name: "IX_reading_state_plan_id",
            table: "reading_state",
            column: "plan_id");

        migrationBuilder.Sql(
            "CREATE INDEX \"IX_thread_notes_user_id_created_at_desc\" ON thread_notes (user_id, created_at DESC);");

        migrationBuilder.CreateIndex(
            name: "IX_user_plans_plan_id",
            table: "user_plans",
            column: "plan_id");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "daily_completions");
        migrationBuilder.DropTable(name: "plan_days");
        migrationBuilder.DropTable(name: "recall_items");
        migrationBuilder.DropTable(name: "reading_state");
        migrationBuilder.DropTable(name: "thread_notes");
        migrationBuilder.DropTable(name: "user_plans");
        migrationBuilder.DropTable(name: "user_settings");
        migrationBuilder.DropTable(name: "plans");
        migrationBuilder.DropTable(name: "users");
    }
}
