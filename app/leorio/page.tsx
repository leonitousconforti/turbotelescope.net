import Image from "next/image"; // Next.js Image component
import LeorioGif from "@/app/leorio/assets/leorio-leolio.gif"; // Import the image

export default function Page() {
    return (
        <>
            <Image
                src={LeorioGif}
                alt="Leorio from Hunter x Hunter"
                // width={500} // Set appropriate width
                // height={500} // Set appropriate height
            />
        </>
    );
}
