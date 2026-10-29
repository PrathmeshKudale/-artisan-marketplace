"use client";

export function VideoShowcase() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Video */}
      <video
        className="w-full h-auto block"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="https://images.unsplash.com/photo-1531299204812-e6d44d9a185c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      >
        <source
          src="https://cdn.builder.io/o/assets%2Ff1ce823622ae4b55a2cc7cc1ca8532c5%2Fe86a8089deb84d51bc4eece9e992bbc0?alt=media&token=e0941836-4c77-4002-ad9b-f8e4acd786a5&apiKey=f1ce823622ae4b55a2cc7cc1ca8532c5"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* KarigarSetu Logo Overlay to hide watermark */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white rounded-md p-2 shadow-lg border border-gray-200">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Ff1ce823622ae4b55a2cc7cc1ca8532c5%2Fc74c889d4e194d3cada3e8638aee3374?format=webp&width=800"
            alt="KarigarSetu"
            className="h-8 w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
