import Skeleton from "react-loading-skeleton";

const JobCardSkeleton = () => {
    return (
        <div className="border rounded p-3 mb-3">
            <Skeleton height={25} width={250} />

            <Skeleton count={2} />

            <Skeleton width={150} />
        </div>
    );
}
export default JobCardSkeleton;