<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per settings group (general, contact, home, seo, ...). Value is JSON.
        Schema::create('settings', function (Blueprint $t) {
            $t->string('key', 40)->primary();
            $t->longText('value');
            $t->timestamps();
        });

        Schema::create('fleet_categories', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->integer('order')->default(0);
            $t->timestamps();
        });

        Schema::create('services', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('name');
            $t->string('icon', 40)->default('i-route');
            $t->string('meta')->default('');
            $t->text('blurb')->nullable();
            $t->string('hero_title')->default('');
            $t->text('hero_sub')->nullable();
            $t->longText('body')->nullable();
            $t->text('included')->nullable();
            $t->longText('steps')->nullable();
            $t->string('image', 500)->nullable();
            $t->integer('order')->default(0);
            $t->boolean('active')->default(true);
            $t->boolean('featured')->default(true);
            $t->string('seo_title')->nullable();
            $t->text('seo_description')->nullable();
            $t->text('seo_keywords')->nullable();
            $t->string('og_image', 500)->nullable();
            $t->timestamps();
        });

        Schema::create('vehicles', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('name');
            $t->string('class_label')->default('');
            $t->string('seats_label')->default('');
            $t->integer('capacity')->default(4);
            $t->string('driver_option', 20)->default('chauffeur'); // chauffeur | either
            $t->text('tags')->nullable();
            $t->text('description')->nullable();
            $t->longText('body')->nullable();
            $t->string('luggage')->default('');
            $t->string('best_for')->default('');
            $t->text('features')->nullable();
            $t->longText('images')->nullable();
            $t->string('alt')->default('');
            $t->integer('order')->default(0);
            $t->boolean('active')->default(true);
            $t->boolean('featured')->default(false);
            $t->foreignId('fleet_category_id')->nullable()->constrained('fleet_categories')->nullOnDelete();
            $t->string('seo_title')->nullable();
            $t->text('seo_description')->nullable();
            $t->text('seo_keywords')->nullable();
            $t->string('og_image', 500)->nullable();
            $t->timestamps();
        });

        Schema::create('service_vehicle', function (Blueprint $t) {
            $t->foreignId('service_id')->constrained()->cascadeOnDelete();
            $t->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $t->primary(['service_id', 'vehicle_id']);
        });

        Schema::create('faqs', function (Blueprint $t) {
            $t->id();
            $t->string('question', 500);
            $t->text('answer');
            $t->integer('order')->default(0);
            $t->boolean('active')->default(true);
            $t->boolean('show_on_home')->default(true);
            $t->timestamps();
        });

        Schema::create('faq_service', function (Blueprint $t) {
            $t->foreignId('faq_id')->constrained()->cascadeOnDelete();
            $t->foreignId('service_id')->constrained()->cascadeOnDelete();
            $t->primary(['faq_id', 'service_id']);
        });

        Schema::create('testimonials', function (Blueprint $t) {
            $t->id();
            $t->text('quote');
            $t->string('name');
            $t->string('role')->default('');
            $t->string('avatar', 4)->default('');
            $t->string('stat', 40)->default('');
            $t->string('stat_label', 60)->default('');
            $t->unsignedTinyInteger('rating')->default(5);
            $t->integer('order')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        // Emirates (shown on the map), airports and neighbourhoods served.
        Schema::create('areas', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('code', 10)->default('');
            $t->string('note')->default('');
            $t->string('badge', 60)->default('');
            $t->string('kind', 20)->default('emirate'); // emirate | airport | area
            $t->boolean('is_hub')->default(false);
            $t->string('map_key', 60)->nullable();
            $t->integer('order')->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('routes', function (Blueprint $t) {
            $t->id();
            $t->string('from');
            $t->string('to');
            $t->integer('km')->nullable();
            $t->integer('mins')->nullable();
            $t->string('note')->default('');
            $t->integer('order')->default(0);
            $t->boolean('active')->default(true);
            $t->boolean('show_in_ticker')->default(true);
            $t->timestamps();
        });

        Schema::create('posts', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('title');
            $t->text('excerpt')->nullable();
            $t->longText('body')->nullable();
            $t->string('category', 80)->default('General');
            $t->text('tags')->nullable();
            $t->string('cover_image', 500)->nullable();
            $t->string('theme', 20)->default('ember');
            $t->string('author')->default('');
            $t->string('status', 20)->default('draft'); // draft | review | published | archived
            $t->timestamp('published_at')->nullable();
            $t->integer('read_minutes')->default(3);
            $t->unsignedInteger('views')->default(0);
            $t->string('seo_title')->nullable();
            $t->text('seo_description')->nullable();
            $t->text('seo_keywords')->nullable();
            $t->string('og_image', 500)->nullable();
            $t->timestamps();
            $t->index(['status', 'published_at']);
        });

        // Free-form CMS pages (privacy policy, terms, landing pages).
        Schema::create('pages', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('title');
            $t->text('subtitle')->nullable();
            $t->longText('body')->nullable();
            $t->string('status', 20)->default('published');
            $t->boolean('show_in_footer')->default(false);
            $t->integer('order')->default(0);
            $t->string('seo_title')->nullable();
            $t->text('seo_description')->nullable();
            $t->text('seo_keywords')->nullable();
            $t->string('og_image', 500)->nullable();
            $t->timestamps();
        });

        Schema::create('quote_requests', function (Blueprint $t) {
            $t->id();
            $t->string('ref', 20)->unique()->nullable();
            $t->string('name');
            $t->string('phone', 60);
            $t->string('email')->default('');
            $t->string('company')->default('');
            $t->string('service')->default('');
            $t->string('vehicle')->default('');
            $t->string('pickup')->default('');
            $t->string('dropoff')->default('');
            $t->string('date', 20)->default('');
            $t->string('time', 10)->default('');
            $t->string('passengers', 20)->default('');
            $t->string('driver_option', 80)->default('');
            $t->text('message')->nullable();
            $t->string('source', 60)->default('website');
            $t->string('page_url')->default('');
            $t->string('status', 20)->default('new'); // new | contacted | quoted | confirmed | closed | spam
            $t->text('notes')->nullable();
            $t->string('ip', 45)->default('');
            $t->string('user_agent', 300)->default('');
            $t->timestamps();
            $t->index('status');
            $t->index('created_at');
        });

        Schema::create('media', function (Blueprint $t) {
            $t->id();
            $t->string('url', 500);
            $t->string('filename');
            $t->string('original_name')->default('');
            $t->string('mime', 60);
            $t->unsignedInteger('size');
            $t->unsignedInteger('width')->nullable();
            $t->unsignedInteger('height')->nullable();
            $t->string('alt')->default('');
            $t->timestamps();
        });

        Schema::create('activities', function (Blueprint $t) {
            $t->id();
            $t->string('icon', 30)->default('i-doc');
            $t->text('text');
            $t->string('user_name')->default('');
            $t->timestamps();
            $t->index('created_at');
        });
    }

    public function down(): void
    {
        foreach (['activities', 'media', 'quote_requests', 'pages', 'posts', 'routes', 'areas', 'testimonials', 'faq_service', 'faqs', 'service_vehicle', 'vehicles', 'services', 'fleet_categories', 'settings'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
