import axios, { get } from "axios";
import React from "react";
import globalApi from "@/_utils/globalApi";
import Image from "next/image";

const page = async () => {
  const data = await globalApi.getAllProducts();
  console.log("Full data:", data);
  console.log("First item images:", data.data[0]?.images);
  return (
    <div>
      {data.data.map((item, index) => (
        <div key={index}>
          <p>
            {index + 1}.{item.name}
            {item.price}
            {item.images && item.images.length > 0 && (
              <Image
                src={`http://localhost:1337${item.images[0].url}`}
                alt={item.name}
                width={500}
                height={500}
              />
            )}
          </p>
        </div>
      ))}
    </div>
  );
};

export default page;
