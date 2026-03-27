import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FAQ = [
  {
    id: "upload",
    q: "How do I upload a song?",
    a: "Login with your Internet Identity, then click 'Upload' in the sidebar. Fill in the song title, artist name, and select your audio file. Click 'Upload Song' to share it with the world.",
  },
  {
    id: "formats",
    q: "What audio formats are supported?",
    a: "streetsurmusic supports MP3, WAV, FLAC, OGG, and most common audio formats. Make sure your file is a valid audio file before uploading.",
  },
  {
    id: "search",
    q: "How do I search for songs?",
    a: "Use the search bar at the top of the page. Type in a song title or artist name and results will appear instantly.",
  },
  {
    id: "delete",
    q: "Can I delete my uploaded songs?",
    a: "Yes! Go to your Profile page and you'll see all your uploaded tracks. Hover over a song and click the trash icon to delete it.",
  },
  {
    id: "free",
    q: "Is streetsurmusic free to use?",
    a: "Yes, streetsurmusic is completely free. Listen to unlimited music and upload your own tracks for the community to enjoy.",
  },
];

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="help.dialog"
        className="bg-popover border-border max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Help & FAQ</DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((item) => (
            <AccordionItem
              key={item.id}
              value={`faq-${item.id}`}
              className="border-border"
            >
              <AccordionTrigger className="text-sm text-left hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
