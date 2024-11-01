import { MetadataRoute } from "next";

const basePath = "https://turbotelescope.net";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: basePath + "/",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
