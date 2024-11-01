import { MetadataRoute } from "next";

const basePath = "https://popcorn.spa.umn.edu";

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
