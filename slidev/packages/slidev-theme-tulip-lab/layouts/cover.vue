<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import gangLiPhoto from '../assets/gangli-author.png'
import logo from '../assets/tulip-logo.png'
import { normaliseCoverConfig, resolvePublicAssetPath } from '../utils/coverConfig'

const { $slidev } = useSlideContext()
const nav = useNav()
const cover = computed(() => normaliseCoverConfig(
  $slidev.configs as Record<string, unknown>,
))
const authorPhoto = computed(() => {
  const configured = resolvePublicAssetPath(
    cover.value.authorPhoto,
    import.meta.env.BASE_URL,
  )
  if (configured)
    return configured

  return cover.value.author.includes('Gang Li') ? gangLiPhoto : undefined
})
const contactPage = computed(() => (
  nav.slides.value.find((slide) => {
    const layout = slide.meta.slide?.frontmatter?.layout
    return layout === 'contact' || layout === 'tulip-contact'
  })?.no
  ?? nav.total.value
))
const tocPage = computed(() => (
  nav.slides.value.find((slide) => {
    const frontmatter = slide.meta.slide?.frontmatter
    return frontmatter?.layout === 'toc' || frontmatter?.navigation === 'toc'
  })?.no
  ?? 2
))
</script>

<template>
  <div class="slidev-layout tulip-cover" :class="{ 'tulip-cover--without-photo': !authorPhoto }">
    <div class="tulip-cover-top" />

    <main class="tulip-cover-main">
      <div class="tulip-cover-heading">
        <p class="tulip-cover-course">{{ cover.course }}</p>
        <h1>
          <button
            type="button"
            class="tulip-cover-title-link"
            aria-label="Open table of contents"
            title="Open table of contents"
            @click="nav.go(tocPage)"
          >
            {{ cover.title }}
          </button>
        </h1>
        <p v-if="cover.subtitle" class="tulip-cover-subtitle">{{ cover.subtitle }}</p>
      </div>

      <img :src="logo" class="tulip-cover-logo" alt="TULIP Lab" />

      <section v-if="authorPhoto || cover.author || cover.affiliation" class="tulip-cover-portrait">
        <button
          v-if="authorPhoto"
          type="button"
          class="tulip-cover-photo-link"
          aria-label="Go to contact slide"
          @click="nav.go(contactPage)"
        >
          <span class="tulip-cover-photo-frame">
            <img
              :src="authorPhoto"
              class="tulip-cover-photo"
              :alt="cover.author ? `${cover.author} portrait` : 'Author portrait'"
            />
          </span>
        </button>
        <div v-if="cover.author || cover.affiliation" class="tulip-cover-author">
          <strong v-if="cover.author">{{ cover.author }}</strong>
          <span v-if="cover.affiliation">{{ cover.affiliation }}</span>
        </div>
      </section>
    </main>

    <div class="tulip-cover-bottom" />
  </div>
</template>

<style scoped>
.tulip-cover {
  --tulip-cover-deep: #3e2f7c;
  --tulip-cover-pale: #f0efff;
  --tulip-cover-band: #c7c3ef;
  position: relative;
  overflow: hidden;
  padding: 0;
  background: #fff;
}

.tulip-cover-top {
  position: absolute;
  inset: 0 0 auto;
  height: 20%;
  border-bottom: 2px solid var(--tulip-cover-deep);
  background: var(--tulip-cover-pale);
}

.tulip-cover-bottom {
  position: absolute;
  inset: auto 0 0;
  height: 10%;
  background: var(--tulip-cover-band);
}

.tulip-cover-main {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.tulip-cover-heading {
  position: absolute;
  top: 28%;
  right: 6%;
  left: 6%;
  text-align: center;
}

.tulip-cover-course {
  margin: 0 0 0.28rem;
  color: var(--tulip-cover-deep);
  font-family: var(--tulip-serif);
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.tulip-cover-heading h1 {
  margin: 0;
  color: var(--tulip-cover-deep);
  font-family: var(--tulip-serif);
  font-size: 2.55rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.06;
}

.tulip-cover-title-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: 0;
  line-height: inherit;
  cursor: pointer;
}

.tulip-cover-title-link:hover {
  text-decoration: underline;
  text-decoration-thickness: 0.06em;
  text-underline-offset: 0.12em;
}

.tulip-cover-title-link:focus-visible {
  outline: 2px solid var(--tulip-cover-deep);
  outline-offset: 0.18rem;
}

.tulip-cover-subtitle {
  margin: 0.48rem auto 0;
  color: color-mix(in srgb, var(--tulip-cover-deep) 76%, white);
  font-family: var(--tulip-serif);
  font-size: 1.18rem;
  line-height: 1.35;
}

.tulip-cover-logo {
  position: absolute;
  bottom: 8.4%;
  left: 5.2%;
  width: 15.5%;
  max-height: 44%;
  object-fit: contain;
}

.tulip-cover-portrait {
  position: absolute;
  top: 47.5%;
  left: 50%;
  display: flex;
  width: 40%;
  transform: translateX(-50%);
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.tulip-cover-photo-frame {
  position: relative;
  display: block;
  width: 6.4rem;
  height: 6.4rem;
  overflow: hidden;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--tulip-shadow-raised);
}

.tulip-cover-photo-link {
  border: 0;
  border-radius: 50%;
  padding: 0;
  background: transparent;
  cursor: pointer;
  line-height: 0;
}

.tulip-cover-photo-link:focus-visible {
  outline: 2px solid var(--tulip-cover-deep);
  outline-offset: 0.24rem;
}

.tulip-cover-photo {
  position: absolute;
  top: 0;
  left: 50%;
  width: 145%;
  max-width: none;
  height: auto;
  transform: translateX(-50%);
}

.tulip-cover-author {
  display: flex;
  margin-top: 0.5rem;
  flex-direction: column;
  align-items: center;
  color: var(--tulip-cover-deep);
  font-family: var(--tulip-serif);
  line-height: 1.25;
}

.tulip-cover-author strong {
  font-size: 1.05rem;
  font-weight: 400;
}

.tulip-cover-author span {
  margin-top: 0.3rem;
  font-size: 0.76rem;
}

.tulip-cover--without-photo .tulip-cover-portrait {
  top: 61%;
}
</style>
