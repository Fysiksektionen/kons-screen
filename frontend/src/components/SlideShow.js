import React, {Component} from 'react';

class SlideShow extends Component {

    constructor(props){
        super(props)
        this.state={slides:this.props.slides}
        this.state.activeImage={src: "", text: ""}
        this.state.carousel_index=0
    }
    
    componentDidMount () {
        // initialise image
        this.setState({slides:this.state.slides.map(slide => {
                if (slide.fullscreen) {slide.style = {width:"100vw","z-index":10}}
                return slide
            })
        }, () => {
            //callback
            this.setState({ activeImage: {...this.state.slides[this.state.carousel_index]}})
        })
        // Rotate the image every 33 seconds (matches css animation as best as possible)
        setInterval(() => {
            if (this.state.slides.length) {
                this.setState({ carousel_index: (this.state.carousel_index + 1 ) % this.state.slides.length })
                this.setState({ activeImage: this.state.slides[this.state.carousel_index] })
            }
        }, 33*1000)
    }
  
    render() {
        return (
            <div>
                <div className="image" style={{...this.state.activeImage.style, height:"100vh",background:"white"}}>
                    <img className="img-left" src={this.state.activeImage.src} 
                        alt={"Hoppsan, något gick fel. Maila något argt till webmaster@f.kth.se"} 
                        onLoad={()=>console.log("loaded img",this.state.activeImage)}
                    />
                    {/* if not fullscreen, draw line in middle*/}
                    {this.state.activeImage.fullscreen ? null : <div className="left-shadow"></div>}
                    {this.state.activeImage.src && this.state.activeImage.text && 
                        <div id="watermark" style={{...this.state.activeImage.style}}>
                                {/* <div class="wm-clock">{this.state.time}</div> */}
                                <div className="wm-text" style={{...this.state.activeImage.style}}>{this.state.activeImage.text}</div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default SlideShow;