import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Food from './models/Food.js';

dotenv.config();

const seedDishes = [
  {
    name: "Butter Chicken with Garlic Naan",
    name_ta: "பூண்டு நானுடன் பட்டர் சிக்கன்",
    category: "Main Course",
    description: "Tender chicken cooked in a rich, creamy, spiced tomato butter gravy, served alongside fresh tandoori garlic naan.",
    description_ta: "ஒரு செழுமையான, கிரீமியான, மசாலா தக்காளி வெண்ணெய் குழம்பில் சமைக்கப்பட்ட மென்மையான கோழி இறைச்சி, புதிய தந்தூரி பூண்டு நானுடன் பரிமாறப்படுகிறது.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Crispy Grilled Salmon",
    name_ta: "மொறுமொறுப்பான வறுக்கப்பட்ட சால்மன்",
    category: "Main Course",
    description: "Pan-seared Atlantic salmon fillet with crispy skin, drizzled in lemon-herb butter sauce and served with roasted asparagus.",
    description_ta: "எலுமிச்சை-மூலிகை வெண்ணெய் சாஸ் தூவப்பட்டு, வறுத்த அஸ்பாரகஸுடன் பரிமாறப்படும் மொறுமொறுப்பான தோலுடன் கூடிய அட்லாண்டிக் சால்மன் மீன்.",
    image: "https://images.unsplash.com/photo-1485921325814-a50433396582?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Premium Veg Hakka Noodles",
    name_ta: "பிரீமியம் வெஜ் ஹக்கா நூடுல்ஸ்",
    category: "Main Course",
    description: "Stir-fried wheat noodles tossed with crisp colorful bell peppers, cabbage, carrots, scallions, and signature soy-sesame glaze.",
    description_ta: "மொறுமொறுப்பான வண்ணமயமான குடைமிளகாய், முட்டைக்கோஸ், கேரட், வெங்காயத்தாள் மற்றும் சிக்னேச்சர் சோயா-எள் சாஸ் ஆகியவற்றுடன் கிளறி வறுத்த கோதுமை நூடுல்ஸ்.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Caesar Salad with Crispy Bacon",
    name_ta: "மொறுமொறுப்பான பேக்கனுடன் சீசர் சாலட்",
    category: "Salad",
    description: "Fresh romaine lettuce tossed with creamy Caesar dressing, garlic croutons, crispy smoked bacon pieces, and shaved parmesan.",
    description_ta: "கிரீமியான சீசர் டிரஸ்ஸிங், பூண்டு க்ரூட்டான்கள், மொறுமொறுப்பான புகைபிடித்த பேக்கன் துண்டுகள் மற்றும் துருவிய பார்மேசன் சீஸ் ஆகியவற்றுடன் கலக்கப்பட்ட புதிய ரோமெய்ன் கீரை.",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Classic Italian Tiramisu",
    name_ta: "கிளாசிக் இத்தாலிய டிராமிசு",
    category: "Dessert",
    description: "Delicate espresso-dipped ladyfinger biscuits layered with a whipped mixture of egg yolks, sugar, mascarpone, and cocoa powder.",
    description_ta: "முட்டையின் மஞ்சள் கருக்கள், சர்க்கரை, மஸ்கார்போன் மற்றும் கோகோ தூள் ஆகியவற்றின் கலவையுடன் அடுக்கப்பட்ட மென்மையான எஸ்பிரெசோவில் நனைத்த லேடிஃபிங்கர் பிஸ்கட்.",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Double Chocolate Lava Cake",
    name_ta: "டபுள் சாக்லேட் லாவா கேக்",
    category: "Dessert",
    description: "Warm chocolate sponge cake with a liquid chocolate core, served with a scoop of premium Madagascan vanilla ice cream.",
    description_ta: "பிரீமியம் மடகாஸ்கன் வெண்ணிலா ஐஸ்கிரீமுடன் பரிமாறப்படும் திரவ சாக்லேட் மையத்தைக் கொண்ட சூடான சாக்லேட் ஸ்பாஞ்ச் கேக்.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Classic Garlic Butter Garlic Bread",
    name_ta: "கிளாசிக் பூண்டு வெண்ணெய் பூண்டு ரொட்டி",
    category: "Starter",
    description: "Toasted baguette slices smothered in garlic, fresh parsley, and melted unsalted butter, topped with bubbling mozzarella.",
    description_ta: "பூண்டு, புதிய பார்ஸ்லி மற்றும் உருகிய உப்பு இல்லாத வெண்ணெய் தடவி, மொஸரெல்லா சீஸ் தூவி வறுக்கப்பட்ட பக்கோடா துண்டுகள்.",
    image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Spiced Mango Smoothie",
    name_ta: "மசாலா மாம்பழ ஸ்மூத்தி",
    category: "Beverage",
    description: "Creamy blend of ripe Alphonso mangoes, Greek yogurt, honey, and a pinch of ground cardamom, served chilled.",
    description_ta: "பழுத்த அல்போன்சோ மாம்பழங்கள், கிரேக்க தயிர், தேன் மற்றும் ஒரு சிட்டிகை ஏலக்காய் தூள் ஆகியவற்றின் கிரீமியான கலவை, குளிராக பரிமாறப்படுகிறது.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Creamy Roasted Tomato Soup",
    name_ta: "கிரீமியான வறுத்த தக்காளி சூப்",
    category: "Soup",
    description: "Vibrant soup prepared with vine-roasted tomatoes, garlic, extra virgin olive oil, fresh basil leaves, and a dash of double cream.",
    description_ta: "வறுத்த தக்காளி, பூண்டு, கூடுதல் கன்னி ஆலிவ் எண்ணெய், புதிய துளசி இலைகள் மற்றும் ஒரு துளி கிரீம் கொண்டு தயாரிக்கப்படும் துடிப்பான சூப்.",
    image: "https://images.unsplash.com/photo-1547592165-e1d17fed6005?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Signature Spicy Chicken Wings",
    name_ta: "சிக்னேச்சர் காரமான சிக்கன் விங்ஸ்",
    category: "Starter",
    description: "Deep-fried chicken wings glazed in a spicy honey sriracha marinade, served with creamy blue cheese dip.",
    description_ta: "காரமான தேன் ஸ்ரீராச்சா மரினேடில் மெருகூட்டப்பட்டு, கிரீமியான புளூ சீஸ் டிப்புடன் பரிமாறப்படும் வறுத்த கோழி இறக்கைகள்.",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
    available: true
  }
];

(async () => {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully! Seeding premium food items...');
    
    // Clear existing
    await Food.deleteMany({});
    console.log('Deleted all old food items.');

    // Insert new
    const createdFoods = await Food.insertMany(seedDishes);
    console.log(`Seeded ${createdFoods.length} premium food items successfully!`);
  } catch (err) {
    console.error('Seeding Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
})();
