import ShopDetails from "@/components/shop/shop-single/ShopDetails";

export const metadata = {
  title: "Shop-details || RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
};

const ShopSingleDyanmic = ({ params }) => {
  return (
    <>
      <ShopDetails id={params.id} />
    </>
  );
};

export default ShopSingleDyanmic;
