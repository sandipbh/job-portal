import ShopDetails from "@/components/shop/shop-single/ShopDetails";

export const metadata = {
  title: "Shop-details || Superio - Job Borad React NextJS Template",
  description: "Superio - Job Borad React NextJS Template",
};

const ShopSingleDyanmic = ({ params }) => {
  return (
    <>
      <ShopDetails id={params.id} />
    </>
  );
};

export default ShopSingleDyanmic;
