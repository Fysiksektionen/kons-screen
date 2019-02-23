import React, {Component} from 'react';

class SlideShow extends Component {

    constructor(props){
        super(props)
        this.state={}
        this.state.activeImage={src: "", text: ""}
        this.state.carousel_index=0
    }
    
    componentDidMount () {
        // initialise image
        this.setState({ activeImage: this.props.slides[this.state.carousel_index] })

        // Rotate the image every 30 seconds
        setInterval(() => {
            if (this.props.slides.length) {
                this.setState({ carousel_index: (this.state.carousel_index + 1 ) % this.props.slides.length })
                this.setState({ activeImage: this.props.slides[this.state.carousel_index] })
            }
        }, 10*1000)
    }
  
    render() {
        return (
            <div>
                <div className="image">
                    <img className="img-left" src={this.state.activeImage.src} 
                        alt={"Hoppsan, något gick fel. Maila något argt till webmaster@f.kth.se"} 
                        onLoad={()=>console.log("loaded img",this.state.activeImage)}
                    />
                    <div className="left-shadow"></div>
                    {this.state.activeImage.src && this.state.activeImage.text && 
                        <div id="watermark">
                                {/* <div class="wm-clock">{this.state.time}</div> */}
                                <div className="wm-text">{this.state.activeImage.text}</div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default SlideShow;