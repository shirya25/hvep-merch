from django.contrib import admin
from .models import Product, Category
admin.site.site_url = "/merch/"

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('name',)
    list_editable = ('price', 'stock')
