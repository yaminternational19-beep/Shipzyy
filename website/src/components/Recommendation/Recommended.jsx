import { useRef } from "react";
import Card from "../Product/Productcard/Productcard";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

function Recommended({ products = [] }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="w-full my-16">
      <div className="flex justify-between items-center mb-8">
        <div className="border-l-4 border-green-500 pl-4">
          {/* <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Recommended</h2> */}
          <p className="text-xl text-yellow-400 font-bold mt-1 uppercase tracking-tighter">Handpicked for you</p>
        </div>
        
       
      </div>

     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {products.map((item) => (
          <div key={item.id}>
            <Card product={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Recommended;