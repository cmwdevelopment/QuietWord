using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using QuietWord.Api.Data;

#nullable disable

namespace QuietWord.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("202602130002_AddFontFamilyToUserSettings")]
public partial class AddFontFamilyToUserSettings : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "font_family",
            table: "user_settings",
            type: "character varying(80)",
            maxLength: 80,
            nullable: false,
            defaultValue: "Roboto");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "font_family",
            table: "user_settings");
    }
}
