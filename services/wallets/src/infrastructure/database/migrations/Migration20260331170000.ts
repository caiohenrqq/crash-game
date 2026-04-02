import { Migration } from '@mikro-orm/migrations';

export class Migration20260331170000 extends Migration {
	override up(): void {
		this.addSql(
			'create table "wallets" ("id" serial primary key, "player_id" varchar(255) not null, "balance_in_cents" int not null);',
		);
		this.addSql(
			'create table "wallet_settlement_operations" ("operation_id" varchar(255) not null, "operation_type" varchar(255) not null, "player_id" varchar(255) not null, "round_id" int not null, "bet_id" int null, "amount_in_cents" int not null, "status" varchar(255) not null, "rejection_reason" varchar(255) null, "occurred_at" timestamptz not null, "published_at" timestamptz null, constraint "wallet_settlement_operations_pkey" primary key ("operation_id"));',
		);
		this.addSql(
			'alter table "wallets" add constraint "wallets_player_id_unique" unique ("player_id");',
		);
	}

	override down(): void {
		this.addSql('drop table if exists "wallet_settlement_operations" cascade;');
		this.addSql('drop table if exists "wallets" cascade;');
	}
}
