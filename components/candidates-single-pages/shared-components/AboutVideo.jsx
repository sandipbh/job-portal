"use client";

import ModalVideo from "@/components/common/ModalVideo";
import Image from "next/image";
import { useState } from "react";

const AboutVideo = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <ModalVideo setIsOpen={setOpen} isOpen={isOpen} videoId="y9j-BL5ocW8" />

      {/* End popup modal video */}
      <div className="video-box">
        <figure className="image">
          <div className="play-now" role="button" onClick={() => setOpen(true)}>
            <Image
              width={815}
              height={364}
              src="/images/resource/video-img.jpg"
              alt="video banner"
            />
            <i className="icon flaticon-play-button-3" aria-hidden="true"></i>
          </div>
        </figure>
      </div>
    </>
  );
};

export default AboutVideo;
