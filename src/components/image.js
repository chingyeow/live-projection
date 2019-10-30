import React, { Component } from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import "./image.css";
import * as contentful from 'contentful';
import {Transition, config, animated} from 'react-spring/renderprops';
import LazyLoad from 'react-lazyload';


 class Image extends Component {
   

   constructor(props) {
     super(props);
    const client = contentful.createClient({
      space: '53b69cu15nc9',
      accessToken: 'QKoBnie67BE6sEYxYZFCYqFdiP4qnX7eX2-fjZOx6zY',
    });

    this.state = {
      client: client,
      currentIdx: 0,
      total: 0,
      currentImgSrc: null,
      mixinIdx: 0,
      mixinSize: 0,
      mixinInterval: 2,
      mixinIntervalCount: 0,
      id: 0,
      lastItem: true,
      toggle: true,
    }
   }

   componentDidMount() {

    setInterval(() => {
      this.state.client.getEntries({
        'content_type': 'liveuploadStatus'
      }).then(entries => {
        // console.log(entries.items);
  
        const size = entries.items[0].fields.size;

        if(size > 0) {

          if(this.state.mixinInterval === this.state.mixinIntervalCount) {
            this.state.client.getEntries({
              'content_type': 'mixinStatus'
            }).then(entries => {
              const mixinSize = entries.items[0].fields.size;

              if(mixinSize > 0) {
                if(this.state.mixinIdx === this.state.mixinSize) {
                  this.loadMedia('mixin', 1);
                  this.setState({mixinSize: mixinSize, mixinIdx: 1, mixinIntervalCount: 0});
                } else {
                  this.loadMedia('mixin', ++this.state.mixinIdx);
                  this.setState({mixinSize: mixinSize, mixinIntervalCount: 0});
                }
              }

            });

            

          } else {
            if(this.state.currentIdx === size) {
              this.loadMedia('liveupload', 1);
              this.setState({total: size, currentIdx: 1, mixinIntervalCount: ++this.state.mixinIntervalCount});
            } else {
              this.loadMedia('liveupload', ++this.state.currentIdx);
              this.setState({total: size, mixinIntervalCount: ++this.state.mixinIntervalCount});
            }
          }
          
        } else {
          this.state.client.getEntries({
            'content_type': 'mixinStatus'
          }).then(entries => {
            const mixinSize = entries.items[0].fields.size;

            if(mixinSize > 0) {
              if(this.state.mixinIdx === this.state.mixinSize) {
                this.loadMedia('mixin', 1);
                this.setState({mixinSize: mixinSize, mixinIdx: 1, mixinIntervalCount: 0});
              } else {
                this.loadMedia('mixin', ++this.state.mixinIdx);
                this.setState({mixinSize: mixinSize, mixinIntervalCount: 0});
              }
            }

          });
        }
        
        
  
  
      });
    }, 5000);
    
  }

  generateRandNum = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

   loadMedia(contentType, idx) {

    this.state.client.getEntries({
      'content_type': contentType,
      'fields.id': idx
    }).then(entries => {
      entries.items.forEach(entry => {
        if(entry.fields.show) {
          if(entry.fields.media.fields.file.contentType === 'video/mp4') {
            this.setState({currentImgSrc: (
              <div className="videoContainer">
            
                <video autoPlay loop muted src={entry.fields.media.fields.file.url} />
  
              </div>
  
              
            )});
          } else {
            const {lastItem, toggle} = this.state;
            const newToggle = !toggle;
            this.setState({toggle: newToggle, currentImgSrc: (
              <div key={entry.fields.media.fields.file.url} className={newToggle? "fade-in": "fadeOut"}>
              <Transition
              items={lastItem}
              from={{ opacity: 0 }}
              enter={{ opacity: 1 }}
              leave={{ opacity: 0 }}
              config={config.molasses}
        >
            {
              lastItem => lastItem &&  (props => <div style={props} ><LazyLoad><img src={entry.fields.media.fields.file.url} /></LazyLoad></div>)
            }
        </Transition>
              </div>
              
  
              
            )});
          }
          
        }
        
      })
    });
   }

  render() {
    return (
      <Carousel
        showArrows={false}
        showStatus={false}
        showIndicators={false}
        showThumbs={false}
        infiniteLoop={true}
      >

                    {this.state.currentImgSrc}

         
      </Carousel>
      )
  }
 }

export default Image
