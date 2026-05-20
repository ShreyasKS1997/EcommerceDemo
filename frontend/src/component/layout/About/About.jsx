import './aboutSection.css';
import { Avatar } from '@mui/material';
import { Email, Facebook, Instagram, LinkedIn, X, YouTube } from '@mui/icons-material';

const About = () => {
  return (
    <div className="aboutSection">
        <div className='info'>
            <Avatar
              style={{ width: '10vmax', height: '10vmax', margin: '2vmax 0' }}
              src=""
              alt="Founder"
            />
            <h2>Website created by Shreyas</h2>
            <h4>This is a Demo E-Commerce wesbite created using M.E.R.N Stack with Redux and RTK query</h4>
        </div>
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
            <p><Email/><a href='mailto:shreyasksofcl@gmail.com'>shreyasksofcl@gmail.com</a></p>
        </div>
    </div>
  );
};

export default About;
