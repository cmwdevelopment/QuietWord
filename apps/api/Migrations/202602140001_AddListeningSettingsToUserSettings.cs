using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using QuietWord.Api.Data;

#nullable disable

namespace QuietWord.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("202602140001_AddListeningSettingsToUserSettings")]
public partial class AddListeningSettingsToUserSettings : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "listening_enabled",
            table: "user_settings",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<decimal>(
            name: "listening_speed",
            table: "user_settings",
            type: "numeric(3,2)",
            precision: 3,
            scale: 2,
            nullable: false,
            defaultValue: 1.00m);

        migrationBuilder.AddColumn<string>(
            name: "listening_voice",
            table: "user_settings",
            type: "character varying(40)",
            maxLength: 40,
            nullable: false,
            defaultValue: "warm_guide");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "listening_enabled", table: "user_settings");
        migrationBuilder.DropColumn(name: "listening_speed", table: "user_settings");
        migrationBuilder.DropColumn(name: "listening_voice", table: "user_settings");
    }
}
