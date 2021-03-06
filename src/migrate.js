import WPAPI from 'wpapi';
import { serialize } from '@wordpress/blocks';
import got from 'got';
import url from "url";
import path from "path";

import { renderer, media } from './blocks';
import { data } from '../content';

const wp = new WPAPI({
    endpoint: process.env.WP_ENDPOINT,
    username: process.env.WP_USER,
    password: process.env.WP_PASSWORD
});

const migrate = async (node, resource) => {
    if (!node.content) return

    const [existing] = await resource().slug(node.slug);
    if (existing) {
        console.log(`skipping "${node.slug}"`)
        return
    }
    
    const mobiledoc = JSON.parse(node.content)
    const rendered = renderer.render(mobiledoc);
    const mediaIds = await Promise.all(media.map(async (block) => {
        try {
            const { id, source_url } = await wp.media()
                  .file(... await download(block.attributes.href))
                  .create({
                      alt_text: block.attributes.alt || "",
                      caption: block.attributes.caption || ""
                  });
            block.attributes.id = id
            block.attributes.url = source_url
            block.attributes.href = source_url;
            return id;
        }
        catch (e) {
            console.error(`failed to upload "${block.attributes.href}"`)
        }
    }));
    media.length = 0;

    let featured = null;
    const { url, alt, caption } = node.image ||
          node.featured.image || {}
    try {
        if (url) {
            featured = await wp.media()
                .file(... await download(url))
                .create({
                    alt_text: alt || "",
                    caption: caption || ""
                });
            mediaIds.push(featured.id);
        }
    }
    catch (e) {
        console.error(`failed to upload featured "${url}"`)
    }
    
    console.log(`creating "${node.slug}"`);
    let id
    try {
        let { id } = await resource().create({
            title: node.title,
            excerpt: node.featured.description,
            slug: node.slug,
            featured_media: featured && featured.id,
            content: serialize(rendered.result),
            date_gmt: new Date(node.publishedAt),
            status: 'publish',
        })
    }
    catch (e) {
        console.error(`failed to create "${url}"`)
    }
    
    await Promise.all(mediaIds.map(async (mediaId) => {
        if (mediaId) wp.media().id(mediaId).update({
            post: id,
            date_gmt: new Date(node.publishedAt)
        });
    }));
}

const download = async (location) => {
    console.log(`downloading "${location}"`);
    const result = await got.get(location).buffer();
    const { pathname } = url.parse(location)
    return [result, decodeURIComponent(path.basename(pathname))];
}

wp.vacatures = wp.registerRoute('wp/v2', 'vacatures/(?P<id>)');

const findVacatures = () => {
    const { node } = data.pages.edges.find(({node}) =>
        node.slug === "vacatures")
    const [[name, { items }]] = JSON.parse(node.content).cards
    return new Set(items.map(({ nodeId }) => nodeId))
}

(async () => {
    const vacatures = findVacatures();
    console.log(`found ${vacatures.size} vacatures`)

    await data.articles.edges.reduce(async (previous, {node}) => {
        await previous;
        return migrate(node, () => wp.posts());
    }, Promise.resolve());

    await data.pages.edges.reduce(async (previous, {node}) => {
        await previous;
        return vacatures.has(node.id) ?
            migrate(node, () => wp.vacatures()) :
            migrate(node, () => wp.pages());
    }, Promise.resolve());
})()
