
import MySubscriptions from "./MySubscriptions";
import NotificationSettings from "./NotificationSettings";
import PopularNewsletters from "./PopularNewsletters";

export default function Sidebar({ subscribedNewsletters, handleSubscribe, newsletters }) {
  return (
    <div className="lg:col-span-1">
      <div className="space-y-6">
        <MySubscriptions 
          subscribedNewsletters={subscribedNewsletters} 
          handleSubscribe={handleSubscribe} 
        />
        <NotificationSettings />
        <PopularNewsletters newsletters={newsletters} />
      </div>
    </div>
  );
}
