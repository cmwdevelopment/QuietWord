using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using QuietWord.Api.Data;

#nullable disable

namespace QuietWord.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("202602130004_AddAccentColorToUserSettings")]
public partial class AddAccentColorToUserSettings : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "accent_color",
            table: "user_settings",
            type: "character varying(40)",
            maxLength: 40,
            nullable: false,
            defaultValue: "teal_calm");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "accent_color", table: "user_settings");
    }
}
