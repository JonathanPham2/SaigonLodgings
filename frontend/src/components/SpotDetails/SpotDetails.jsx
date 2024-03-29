import { useDispatch, useSelector} from "react-redux"
import { useParams } from "react-router-dom"
import { spotByIdFetcher } from "../../store/spot"
import { useEffect, useState } from "react"
import './SpotDetails.css'
import { reviewsBySpotIdFetcher, selectorReviewsArray } from "../../store/reviews"
import OpenModalButton from "../OpenModalButton/OpenModalButton"
import ReviewModal from "../ReviewModal"
import DeleteModal from "../DeleteModal"





const SpotDetails = () => {
    // state error for invalid id
    const [errors, setErrors] = useState({})
    const [reviewsErrors, setReviewsErrors] = useState({})
    const [reviewUpdated, setReviewUpdated] = useState(false);
    // id of the spot
    const {id} = useParams()
    // convert id from string integer
    const spotId = parseInt(id,10)
    const dispatch = useDispatch()
    const session =  useSelector(state => state.session)
    const currentUser = session.user
    
    const onReviewDeleted = () => {
        setReviewUpdated(!reviewUpdated)
    }
    
    
    useEffect(() => {
        dispatch(spotByIdFetcher(spotId))
        .catch(async (res) => {
            const data = await res.json();
            if(data&& data.message){
                setErrors(data)
            }
        });
        dispatch(reviewsBySpotIdFetcher(spotId))
        .catch(async (res) => {
            const data = await res.json()
            if(data){
                setReviewsErrors(data)
            }
        })
     
        
    },[dispatch,spotId, reviewUpdated])
    const spot = useSelector(state => state.spots[spotId])
    let reviews = useSelector(selectorReviewsArray)
    const owner = spot?.Owner
    const images = spot?.SpotImages
    reviews = reviews?.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    
   


    const hasAlreadyReview = reviews?.some(review => review.userId === currentUser?.id)

    return (
        <main className="main-spot-details">
            <section className="spot-details-header">
                <h1 id="spot-header">{spot?.name}</h1>
                <h3>{spot?.city}, {spot?.state}, {spot?.country}</h3>
                <div className="images-container">
                    {images?.map((image, index) => (<img key={image.id} src={image.url} alt={spot?.name} className={index >= 5 ? "hidden-image": (index === 0 ? "main-image":`small-image ${index}`)}/>))}


                    {errors.message && <h1>{errors.message}</h1> }
                    {reviewsErrors.message && <h1>{reviewsErrors.message}</h1>}
                </div>
            </section>
            <section className="spot-details-body">
                <h2>Hosted by {owner?.firstName} {owner?.lastName}</h2>
                <div className="box-container-price">
                    <p>{spot?.description}</p>
                    <div className="price-reviews-stars">
                        <div className="price-review-container">
                            <p id="spot-price"><strong>${spot?.price}</strong> night</p>
                            <p id="spot-rating"><i className="fa fa-star"></i>{spot?.avgRating === "Rate me"? "No Ratings Yet" :`${Number(spot?.avgRating).toFixed(1)}`}</p>
                            <p id="spot-review-count">{spot?.numReviews} {spot?.numReviews === 1 ? "review" : "reviews"}</p>
                        </div>
                        <div className="button-container">
                            <button  onClick={() => alert("feature coming soon")}>Reserve</button>
                        </div>
                    </div>
                </div>
                <hr />
            </section>
            <section className="reviews-comments">
                <div className="reviews-header">
                    <h2><span><i className="fa fa-star"></i>{spot?.avgRating === "Rate me"? "No Ratings Yet" :`${Number(spot?.avgRating).toFixed(1)}`}</span></h2>
                    <div className="divider"></div>
                    <h2><span>{spot?.numReviews} {spot?.numReviews === 1 ? "review" :"reviews"}</span></h2>
                </div>
                <div className="post-review-button-container">
                    <OpenModalButton 
                     buttonText= "Post review"
                      className={!session.user || currentUser.id === owner?.id || hasAlreadyReview  ? "hidden-button": "review-button" }
                      modalComponent={<ReviewModal id={spot?.id} />}
                      
                      />
                </div>
                {/* <hr className="second-line"/> */}
                <div className="comments-section">{
                   reviews && reviews.length === 0 && <span>Be the first to post a review</span>
                }
                    {reviews?.map((review) => (
                        <div className="user-comment" key={review.id}>
                            <h3>{review?.User?.firstName}</h3>
                            <span style={{fontWeight:"100"}}>
                                {(()=> {
                                    // convert date into human readable
                                    const reviewDate = new Date(review.createdAt)
                                    const options = { year: "numeric", month: "long" };
                                    return new Intl.DateTimeFormat("en-US", options).format(reviewDate)
                                })()}
                            </span>
                            <p>{review.review}</p>
                            {review.userId === currentUser?.id && (
                               <OpenModalButton 
                               buttonText= "Delete"
                               modalComponent={<DeleteModal isDeleteReview = {true} reviewId={review.id} onReviewDeleted={onReviewDeleted} />}
                               
                               />
                            )}
                            
                            
                            
                            
                         </div>
                        
                        
                        
                    ))}


                </div>
            </section>
        </main>
    )


}



export default SpotDetails