import * as FIRENEF from "#firenef";

export class FontLoaderScript extends FIRENEF.Script {
    constructor(name = "Font Loader Script") {
        super(name);

        const fontAttribute = new FIRENEF.Attribute("Font");
        fontAttribute.addField("Json", "path", "");
        this.attributes.push(fontAttribute);

        this.style = null;
    }

    async setAttributeFieldValue(attribute = 0, field = 0, value, type) {
        await super.setAttributeFieldValue(attribute, field, value, type);
        if (attribute == 0) {
            if (field == 0) {
                this.attributes[0].fields[0].value = JSON.parse(this.getAttributeFieldValue(0, 0));

                const fontConfig = this.getAttributeFieldValue(0, 0);

                const sheet = new CSSStyleSheet();

                let cssBuffer = "";

                for (const font of fontConfig) {
                    const res = await fetch(font.src);
                    if (!res.ok) {
                        console.warn("failed to load font", font.src);
                        continue;
                    }
                    const fontData = await res.arrayBuffer();

                    const blob = new Blob([fontData], { type: "font/ttf" });
                    const fontURL = URL.createObjectURL(blob);

                    cssBuffer += `
                        @font-face {
                            font-family: "${font.name}";
                            src: url("${fontURL}") format("truetype");
                            font-weight: ${font.weight};
                            font-style: ${font.style};
                            font-display: ${font.display};
                        }
                    `;
                }

                sheet.replaceSync(cssBuffer);
                this.style = sheet;
            }
        }
    }

    start() {
        if (!this.style) return;

        document.adoptedStyleSheets = [
            ...document.adoptedStyleSheets,
            this.style
        ];

        this.parent.inneritedStyles.push(this.style);
    }
}