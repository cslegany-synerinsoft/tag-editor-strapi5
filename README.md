# strapi5-tag-editor
> This package adds a customizable tag editor to replace the default one.

## Installation

NPM:

> `npm install @cslegany/tag-editor-strapi5`

Yarn:

> `yarn add @cslegany/tag-editor-strapi5`

## Usage
- Let's imagine that we have two collection types: Article and Tag.
- Normall you'd have to go to Tags in Content Manager and create all your tags. Then you'd go to Articles and create your article and assign the tags in the built-in dropdown.
- However in most cases you need a UI to create or select your tags when you're on the Edit View of your article in Content Manager and you don't want to go back-and-forth between the Articles and the Tags to create your content.
- This plugin was created because we needed such a UI to assign multiple tags to an article.
- After installation, go to Settings > Tag Editor > Configuration and connect Articles and Tags. By default it contains a connection between dummy data like Article and Label, feel free to adjust is according to your needs.
- Click to add a Card and fill in Entity Uid with api::article.article and Tag uid with api::tag.tag
- Thereafter go to the Edit View of an article and click on Edit Tags. The popup dialog displays an input field which could be used to
type in new tags separated by commas. 
- If a new tag gets typed in, it will be created and published automatically and it gets assigned to your article.
- If an existing tag gets typed in, it gets assigned to your article.
- All assigned tags can be seen (and selected or unselected) in the dropdown. Reordering of tags is not supported.
- It is highly recommended to hide the default editor of tags on the Edit View of Article. Click on ... button in the top right corner,
select Configure the view and hide the appropriate field (i.e. tags).
- If you don't hide it, the plugin will function a bit strangely: when you click Save in the dialog, newly selected tags will be injected into
the default editor of tags. Nevertheless, tags removed won't get removed from the default editor because it uses a __temp_key__ variable
to identify list items and unfortunately it isn't available in unstable_useContentManagerContext. Initialvalues or values of form in unstable_useContentManagerContext only contain empty connect and disconnect array by default.

