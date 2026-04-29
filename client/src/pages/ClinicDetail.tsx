import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Globe, Clock, Star, MessageSquare, ArrowLeft, Building2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function ClinicDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const clinicId = parseInt(id || "0");
  const utils = trpc.useUtils();

  // Fetch clinic details
  const { data: clinic, isLoading: clinicLoading } = trpc.clinics.getById.useQuery(
    { id: clinicId },
    { enabled: clinicId > 0 }
  );

  // Fetch specialties, ratings, comments, responses
  const { data: specialties = [] } = trpc.clinics.getSpecialties.useQuery(
    { clinicId },
    { enabled: clinicId > 0 }
  );
  const { data: clinicRatings = [], refetch: refetchRatings } = trpc.ratings.getByClinic.useQuery(
    { clinicId },
    { enabled: clinicId > 0 }
  );
  const { data: clinicComments = [], refetch: refetchComments } = trpc.comments.getByClinic.useQuery(
    { clinicId },
    { enabled: clinicId > 0 }
  );
  const { data: clinicResponses = [] } = trpc.comments.getResponsesForClinic.useQuery(
    { clinicId },
    { enabled: clinicId > 0 }
  );
  const { data: userExistingRating } = trpc.ratings.getUserRating.useQuery(
    { clinicId },
    { enabled: clinicId > 0 && isAuthenticated }
  );

  // Mutations
  const createRating = trpc.ratings.create.useMutation({
    onSuccess: () => {
      refetchRatings();
      utils.clinics.getById.invalidate({ id: clinicId });
      toast.success("Avaliação enviada com sucesso!");
      setRating(0);
    },
    onError: () => toast.error("Erro ao enviar avaliação"),
  });

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      refetchComments();
      toast.success("Comentário enviado com sucesso!");
      setComment("");
    },
    onError: () => toast.error("Erro ao enviar comentário"),
  });

  const handleSubmitRating = async () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (rating === 0) { toast.error("Por favor, selecione uma classificação"); return; }
    createRating.mutate({ clinicId, score: rating });
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (!comment.trim()) { toast.error("Por favor, escreva um comentário"); return; }
    createComment.mutate({ clinicId, text: comment });
  };

  // Map responses by commentId for quick lookup
  const responsesByCommentId = clinicResponses.reduce((acc: Record<number, any[]>, r: any) => {
    if (!acc[r.commentId]) acc[r.commentId] = [];
    acc[r.commentId].push(r);
    return acc;
  }, {});

  if (clinicLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Clínica não encontrada</p>
          <Button onClick={() => navigate("/")} variant="outline">Voltar para Home</Button>
        </div>
      </div>
    );
  }

  const averageRating =
    clinicRatings.length > 0
      ? clinicRatings.reduce((sum: number, r: any) => sum + r.score, 0) / clinicRatings.length
      : 0;

  let hours: Record<string, string> | null = null;
  try {
    if (clinic.openingHours) hours = JSON.parse(clinic.openingHours);
  } catch { /* plain text */ }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold text-slate-900 truncate">{clinic.name}</h1>
          {clinic.isVerified && (
            <span className="ml-auto shrink-0 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
              ✓ Verificada
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            {clinic.photoUrl ? (
              <div className="rounded-xl overflow-hidden shadow-lg h-72 bg-slate-200">
                <img src={clinic.photoUrl} alt={clinic.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-xl h-40 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-blue-300" />
              </div>
            )}

            {/* Description */}
            {clinic.description && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-3">Sobre</h2>
                <p className="text-slate-600 leading-relaxed">{clinic.description}</p>
              </Card>
            )}

            {/* Specialties */}
            {specialties.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Especialidades</h2>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((spec: any) => (
                    <span
                      key={spec.specialties.id}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium"
                    >
                      {spec.specialties.name}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Contact & Hours */}
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Informações</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">{clinic.address}</p>
                    <p className="text-sm text-slate-600">{clinic.city}, {clinic.state} {clinic.zipCode}</p>
                  </div>
                </div>
                {clinic.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <a href={`tel:${clinic.phone}`} className="text-blue-600 hover:underline">{clinic.phone}</a>
                  </div>
                )}
                {clinic.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <a href={`mailto:${clinic.email}`} className="text-blue-600 hover:underline">{clinic.email}</a>
                  </div>
                )}
                {clinic.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                      {clinic.website}
                    </a>
                  </div>
                )}
                {clinic.openingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Horário de Funcionamento</p>
                      {hours ? (
                        <div className="space-y-0.5">
                          {Object.entries(hours).map(([day, time]) => (
                            <div key={day} className="flex gap-3 text-sm">
                              <span className="text-slate-500 w-24">{day}</span>
                              <span className="text-slate-700">{time}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{clinic.openingHours}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => navigate(`/clinic/${clinicId}/book`)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
              >
                Agendar Consulta
              </Button>
            </Card>

            {/* Comments Section */}
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comentários ({clinicComments.length})
              </h2>

              {/* Add Comment Form */}
              {isAuthenticated ? (
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                  <Textarea
                    placeholder="Deixe um comentário sobre sua experiência..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-24"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">{comment.length}/1000</span>
                    <Button
                      onClick={handleSubmitComment}
                      disabled={createComment.isPending || !comment.trim()}
                    >
                      {createComment.isPending ? "Enviando..." : "Enviar Comentário"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-600">Faça login para deixar um comentário</p>
                  <Button asChild size="sm"><a href={getLoginUrl()}>Entrar</a></Button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {clinicComments.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    Nenhum comentário ainda. Seja o primeiro!
                  </p>
                ) : (
                  clinicComments.map((c: any) => (
                    <div key={c.id} className="border border-slate-100 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {c.userName || "Paciente"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-700">{c.text}</p>

                      {/* Clinic replies */}
                      {(responsesByCommentId[c.id] || []).map((reply: any) => (
                        <div key={reply.id} className="ml-4 p-3 bg-blue-50 border-l-2 border-blue-400 rounded-r-lg">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Resposta da Clínica</p>
                          <p className="text-sm text-slate-700">{reply.text}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(reply.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Card */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Avaliação</h3>

              {/* Average Rating display */}
              <div className="text-center py-4 bg-slate-50 rounded-lg">
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i: number) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {averageRating > 0 ? averageRating.toFixed(1) : "–"}
                </p>
                <p className="text-sm text-slate-500">
                  {clinicRatings.length > 0
                    ? `${clinicRatings.length} avaliação${clinicRatings.length !== 1 ? "ões" : ""}`
                    : "Sem avaliações ainda"}
                </p>
              </div>

              {/* Rate Form */}
              {isAuthenticated ? (
                <div className="space-y-3">
                  {userExistingRating && (
                    <p className="text-xs text-center text-slate-500">
                      Sua avaliação atual: {userExistingRating.score}★ — você pode atualizá-la
                    </p>
                  )}
                  <p className="text-sm font-medium text-slate-900 text-center">
                    {userExistingRating ? "Atualizar avaliação:" : "Sua avaliação:"}
                  </p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoveredRating || rating || (userExistingRating?.score ?? 0))
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={handleSubmitRating}
                    disabled={createRating.isPending || rating === 0}
                    className="w-full"
                  >
                    {createRating.isPending
                      ? "Enviando..."
                      : userExistingRating
                      ? "Atualizar Avaliação"
                      : "Enviar Avaliação"}
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-3">Faça login para avaliar</p>
                  <Button asChild size="sm" className="w-full">
                    <a href={getLoginUrl()}>Entrar</a>
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
