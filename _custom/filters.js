const { DateTime } = require('luxon')

module.exports = {
    format: function(date, format) {
        return DateTime.fromJSDate(date).toFormat(String(format))
    },

    iso: function(date) {
        return DateTime.fromJSDate(date).toISO({
            includeOffset: false,
            suppressMilliseconds: true
        })
    },

    readableDate: function(date) {
        return DateTime.fromJSDate(date).toFormat('dd LLL yyyy')
    },

    fromIso: function(timestamp) {
        return DateTime.fromISO(timestamp, { zone: 'utc' }).toJSDate()
    },

    obfuscate: function(str) {
        const chars = []
        for (var i = str.length - 1; i >= 0; i--) {
            chars.unshift(['&#', str[i].charCodeAt(), ';'].join(''))
        }
        return chars.join('')
    },

    webmentionsByUrl: function(webmentions, url) {
        const allowedTypes = ['mention-of', 'in-reply-to']

        const clean = entry => {
            const { content } = entry
            if (content && content['content-type'] === 'text/html') {
                if (content.value.length > 2000) {
                    // really long html mentions, usually newsletters or compilations
                    entry.content.value = `mentioned this in <a href="${
                        entry.url
                    }">${entry.url}</a>`
                }
                // strip linebreaks
                content.value = content.value.replace(/<br\s*\/?>/gi, '')
            }
            return entry
        }

        return webmentions
            .filter(entry => entry['wm-target'] === url)
            .filter(entry => allowedTypes.includes(entry['wm-property']))
            .filter(entry => !!entry.content)
            .map(clean)
    },

    webmentionCountByType: function(webmentions, url, ...types) {
        return String(
            webmentions
                .filter(entry => entry['wm-target'] === url)
                .filter(entry => types.includes(entry['wm-property'])).length
        )
    },

    excludePost: function(posts, currentPostTitle) {
        return posts
            .filter(post => post.data.title !== currentPostTitle)
            .slice(-10)
    },

    media: function(filename, page) {
        const path = page.inputPath.split('/')
        if (path.length && path.includes('posts')) {
            const subdir = path[path.length - 2]
            return `/assets/media/${subdir}/${filename}`
        }
        return filename
    }
}
