import { Migration } from '@mikro-orm/migrations';

export class Migration20260331170000 extends Migration {
	override up(): void {
		this.addSql(
			'create table "wallets" ("id" serial primary key, "player_id" varchar(255) not null, "balance_in_cents" int not null);',
		);
		this.addSql(
			'alter table "wallets" add constraint "wallets_player_id_unique" unique ("player_id");',
		);
	}

	override down(): void {
		this.addSql('drop table if exists "wallets" cascade;');
	}
}
