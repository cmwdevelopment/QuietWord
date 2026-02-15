using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using QuietWord.Api.Data;

#nullable disable

namespace QuietWord.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("202602150001_AddListeningStyleToUserSettings")]
public partial class AddListeningStyleToUserSettings : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "listening_style",
            table: "user_settings",
            type: "character varying(40)",
            maxLength: 40,
            nullable: false,
            defaultValue: "calm_presence");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "listening_style", table: "user_settings");
    }
}
