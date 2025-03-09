import Image from "next/image";

export default function Custom404() {
    return (

        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100vh",
                flexDirection: "column",
                backgroundImage: "url('/poster_landscape.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative"
            }}
        >

            <h1>404 - Page Not Found</h1>
        </div>
    );
}