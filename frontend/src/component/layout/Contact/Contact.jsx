import React from 'react';
import './Contact.css';
import { Button } from '@mui/material';
import { Email, Facebook, Instagram, LinkedIn, X, YouTube } from '@mui/icons-material';

const Contact = () => {
  return (
    <div className="contactContainer">
        <div className="socialMediaIconLinks">
            <h1>Visit our Social Channels</h1>
            <div className='socialMediaIcons'>
                <a href="/#" target="blank">
                  <YouTube style={{color: 'red'}} className="youtubeSvgIcon" />
                </a>

                <a href="/#" target="blank">
                  <Facebook style={{color: '#1877F2'}} className="instagramSvgIcon" />
                </a>

                <a href="/#" target="blank">
                  <Instagram style={{background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeB 90%)', color: 'white'}} className="instagramSvgIcon" />
                </a>

                <a href="/#" target="blank">
                  <X className="instagramSvgIcon" />
                </a>

                <a href="/#" style={{color: '#0A66C2'}} target="blank">
                  <LinkedIn className="instagramSvgIcon" />
                </a>
            </div>
            <a href="mailto:shreyasksofcl@gmail.com">
              <Button>Contact: shreyasksofcl@gmail.com</Button>
          </a>
        </div>
    </div>
  );
};

export default Contact;
