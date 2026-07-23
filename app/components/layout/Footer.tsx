// import Container from "../ui/Container";
// import { DividerRose } from "../ui/Ornaments";
//
// export default function Footer() {
//     return (
//         <footer className="relative py-16 border-t border-olive/20">
//             <Container>
//                 <DividerRose />
//                 <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted text-sm">
//                     <p>© {new Date().getFullYear()} Mia Law. Все истории вымышлены. Все чувства настоящие.</p>
//                     <div className="flex gap-6">
//                         <a href="#" className="hover:text-rose-gold transition-colors">
//                             Instagram
//                         </a>
//                         <a href="#" className="hover:text-rose-gold transition-colors">
//                             Litnet
//                         </a>
//                     </div>
//                 </div>
//             </Container>
//         </footer>
//     );
// }
import { Container } from "@/components/ui/Container";
import { OrnamentDivider } from "@/components/ui/Ornaments";

export function Footer() {
    return (
        <footer className="py-16 border-t border-[#556B2F]/20 mt-12">
            <Container>
                <OrnamentDivider />
                <div className="text-center text-muted text-sm space-y-2">
                    <p className="font-serif text-warmText text-lg">Mia Law</p>
                    <p>© {new Date().getFullYear()} · Все истории имеют своё продолжение</p>
                </div>
            </Container>
        </footer>
    );
}