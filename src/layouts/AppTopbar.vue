<script setup>
import { useLayout } from '@/layouts/composables/layout.js'

const { toggleMenu } = useLayout();
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <span>База знаний</span>
            </router-link>
        </div>
    </div>
</template>
