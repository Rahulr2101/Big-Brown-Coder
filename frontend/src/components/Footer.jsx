import { cn } from "@/lib/utils";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    "Company": [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Blog", href: "#" }
    ],
    "Product": [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Security", href: "#" },
      { label: "Roadmap", href: "#" }
    ],
    "Resources": [
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Partners", href: "#" }
    ],
    "Legal": [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Licenses", href: "#" }
    ]
  };
  
  return (
    <footer className="relative overflow-hidden bg-white border-t border-lavender">
      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10">
    
          <div className="md:col-span-2">
            <a href="/" className="flex items-center mb-6">
              <div className="w-9 h-9 mr-2 rounded-lg purple-gradient-bg flex items-center justify-center text-white font-bold">P</div>
              <span className="font-bold text-xl">Paymint</span>
            </a>
            <p className="text-foreground/70 text-sm leading-relaxed mb-6 max-w-xs">
              Transforming the way people manage, save, and grow their money with intuitive financial tools.
            </p>
            <div className="flex space-x-4">
              {["Twitter", "LinkedIn", "Instagram", "YouTube"].map((social, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="w-8 h-8 rounded-full bg-lavender flex items-center justify-center text-purple transition-colors hover:bg-purple hover:text-white"
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
        
          {Object.entries(footerLinks).map(([category, links], index) => (
            <div key={index} className="md:col-span-1">
              <h3 className="font-bold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link, i) => (
                  <li key={i}>
                    <a 
                      href={link.href} 
                      className="text-foreground/70 text-sm hover:text-purple transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-lavender mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-foreground/60 text-sm mb-4 md:mb-0">
            © {currentYear} Paymint. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <select className="text-sm bg-lavender rounded-md border-0 py-1.5 pl-3 pr-8 text-foreground/70 focus:ring-1 focus:ring-purple">
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
            </select>
            <select className="text-sm bg-lavender rounded-md border-0 py-1.5 pl-3 pr-8 text-foreground/70 focus:ring-1 focus:ring-purple">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
