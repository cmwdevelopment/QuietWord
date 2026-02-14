using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using QuietWord.Api.Data;

#nullable disable

namespace QuietWord.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("202602130003_AddRecapVoiceAndPlanRecaps")]
public partial class AddRecapVoiceAndPlanRecaps : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "recap_voice",
            table: "user_settings",
            type: "character varying(40)",
            maxLength: 40,
            nullable: false,
            defaultValue: "classic_pastor");

        migrationBuilder.AddColumn<string>(
            name: "recaps",
            table: "plan_days",
            type: "jsonb",
            nullable: false,
            defaultValue: "{}");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "recap_voice", table: "user_settings");
        migrationBuilder.DropColumn(name: "recaps", table: "plan_days");
    }
}
