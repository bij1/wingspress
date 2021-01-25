import { createBlock as createWPBlock,
         registerBlockType } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';
import { Document, HTMLSerializer } from 'simple-dom';
import Renderer from 'mobiledoc-wp-renderer';
import { RENDER_TYPE } from 'mobiledoc-wp-renderer';

registerCoreBlocks()

registerBlockType("acf/cta", {
    title: 'CTA',
    attributes: {
        id: { type: 'string' },
        name: { type: 'string' },
        data: { type: 'object' }
    }
})

registerBlockType("acf/insight", {
    title: 'Insight',
    attributes: {
        id: { type: 'string' },
        name: { type: 'string' },
        data: { type: 'object' }
    }
})

const createMissing = ({payload, env: {name}}) => {
    console.error(`TODO block ${name}`)
    console.error(JSON.stringify(payload, null, 2))
    return createBlock("core/missing", {
        originalName: name,
        originalContent: JSON.stringify(payload)
    })
}

export const cards = [
    {
        name: 'ImageCard',
        type: RENDER_TYPE,
        render: ({payload: {
            src,
            url,
            caption,
            alt
        }}) => createBlock("core/image", {
            url: src,
            alt: alt,
            caption: caption,
            href: url
        })
    },
    {
        name: 'QuoteCard',
        type: RENDER_TYPE,
        render: ({payload: {
            text,
            source,
            sourceUrl,
            type
        }}) => createBlock(type === 1 ? "core/pullquote" : "core/quote", {
            value: `<p>${text}</p>`,
            citation: sourceUrl ?
                `<a href="${sourceUrl}">${source}</a>` : source
        })
    },
    {
        name: 'InsightCard',
        type: RENDER_TYPE,
        render: ({payload: {
            text,
        }}) => createBlock("acf/insight", {
            id: 'generated',
            name: 'acf/insight',
            data: {
                titel: text,
                achtergrond: 'zwart',
                textsize: 'groot'
            }
        })
    },
    {
        name: 'EmbedCard',
        type: RENDER_TYPE,
        render: ({payload: {
            src
        }}) => createBlock("core/embed", {
            align: "wide",
            url: src
        })
    },
    {
        name: 'CTACard',
        type: RENDER_TYPE,
        render: ({payload: {
            title,
            actionText,
            text,
            actionUrl,
            type
        }}) => createBlock("acf/cta", {
            id: 'generated',
            name: 'acf/cta',
            data: {
                cta_title: title,
                cta_text: text,
                cta_link: {
                    title: actionText,
                    url: actionUrl
                }
            }
        })
    },
    {
        name: 'CollectionCard',
        type: RENDER_TYPE,
        render: createMissing // TODO is commonly used
    },
    {
        name: 'CampaignCard',
        type: RENDER_TYPE,
        render: createMissing // TODO uses external API
    },
    {
        name: 'NodesCard',
        type: RENDER_TYPE,
        render: ({payload: {
            type
        }}) => createBlock("core/latest-posts", {
            // TODO configure
        })
    },
    {
        name: 'DataCard',
        type: RENDER_TYPE,
        render: createMissing // TODO? might not be used
    },
    {
        name: 'TestimonialCard',
        type: RENDER_TYPE,
        render: createMissing // TODO? might not be used
    },
    {
        name: 'ChapterCard',
        type: RENDER_TYPE,
        render: createMissing // TODO? might not be used
    },
    {
        name: 'QACard',
        type: RENDER_TYPE,
        render: createMissing // TODO is commonly used
    },
    {
        name: 'TextCard',
        type: RENDER_TYPE,
        render: ({payload: {content}, env: {dom, serializer}}) => {
            var rendered = renderer.render(JSON.parse(content));
            return createBlock("core/group", {}, rendered.result)
        }
    },
];

const createBlock = (name, attributes, inner) => {
    const block = createWPBlock(name, attributes, inner);
    if (block.name === "core/image")
        media.push(block);
    return block;
}

export const media = []

export const renderer = new Renderer({
    cards: cards,
    dom: new Document(),
    serializer: new HTMLSerializer([]),
    createBlock: createBlock
});
