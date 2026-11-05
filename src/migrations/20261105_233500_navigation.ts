import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

import { DEFAULT_NAVIGATION_DATA } from '../components/site/nav'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`navigation_header_items_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`link_type\` text DEFAULT 'url' NOT NULL,
  	\`page_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_header_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_header_items_children_order_idx\` ON \`navigation_header_items_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_header_items_children_parent_id_idx\` ON \`navigation_header_items_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_header_items_children_page_idx\` ON \`navigation_header_items_children\` (\`page_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_header_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`link_type\` text DEFAULT 'url' NOT NULL,
  	\`page_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_header_items_order_idx\` ON \`navigation_header_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_header_items_parent_id_idx\` ON \`navigation_header_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_header_items_page_idx\` ON \`navigation_header_items\` (\`page_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`link_type\` text DEFAULT 'url' NOT NULL,
  	\`page_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_links_order_idx\` ON \`navigation_footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_links_parent_id_idx\` ON \`navigation_footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_links_page_idx\` ON \`navigation_footer_columns_links\` (\`page_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_order_idx\` ON \`navigation_footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_parent_id_idx\` ON \`navigation_footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)

  // Start with the menu the site had before it became editable.
  await payload.updateGlobal({ slug: 'navigation', data: DEFAULT_NAVIGATION_DATA, req, overrideAccess: true })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`navigation_header_items_children\`;`)
  await db.run(sql`DROP TABLE \`navigation_header_items\`;`)
  await db.run(sql`DROP TABLE \`navigation_footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`navigation_footer_columns\`;`)
  await db.run(sql`DROP TABLE \`navigation\`;`)
}
