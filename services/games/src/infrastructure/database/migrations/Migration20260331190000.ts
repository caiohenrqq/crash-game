import { Migration } from '@mikro-orm/migrations';

export class Migration20260331190000 extends Migration {
	override up(): void {
		this.addSql(
			'create table "rounds" ("id" int not null, "state" varchar(255) not null, "crash_point_in_hundredths" int not null, "created_at" timestamptz not null, "activated_at" timestamptz null, "crashed_at" timestamptz null, constraint "rounds_pkey" primary key ("id"));',
		);
		this.addSql(
			'create table "bets" ("id" serial primary key, "round_id" int not null, "player_id" varchar(255) not null, "amount_in_cents" int not null);',
		);
		this.addSql(
			'alter table "bets" add constraint "bets_round_id_player_id_unique" unique ("round_id", "player_id");',
		);
	}

	override down(): void {
		this.addSql('drop table if exists "bets" cascade;');
		this.addSql('drop table if exists "rounds" cascade;');
	}
}
